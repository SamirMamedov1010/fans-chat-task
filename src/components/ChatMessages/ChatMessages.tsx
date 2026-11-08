import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ChatMessageBubble } from '@/components/ChatMessageBubble';
import { MessageComposer } from '@/components/MessageComposer';
import { useBottomSheet, useConversationChat, usePurchases, useToast } from '@/contexts';
import { pickAndPersistMedia, type MediaAttachment, type ThreadMessage } from '@/features/chat';
import {
  MockBulkMessageService,
  subscribeToBulkMessages,
  type BulkMessageRecord,
} from '@/features/contacts';
import { colors, fontFamilies, fontSizes, fontWeights } from '@/theme';

const avatar = require('@/assets/images/avatar.png');

export function ChatMessages({ recipientId }: { recipientId?: string }) {
  const { hasOlderMessages, isHydrated, isOnline, isSyncing, loadOlder, messages, retry, send } =
    useConversationChat(recipientId ?? 'default');
  const { giftEffects, hasPaidAccess } = usePurchases();
  const { open } = useBottomSheet();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<MediaAttachment>();
  const [separateMessages, setSeparateMessages] = useState<BulkMessageRecord[]>([]);
  const bulkMessageService = useMemo(() => new MockBulkMessageService(AsyncStorage), []);
  const lastFailedKey = useRef<string | undefined>(undefined);
  const previouslyHadAccess = useRef(hasPaidAccess);

  const thread = useMemo(() => {
    const gifts: ThreadMessage[] = giftEffects.map((gift) => ({
      key: gift.effectId,
      direction: 'outgoing',
      kind: 'gift',
      text: `You sent a $${gift.amount.toFixed(2)} gift!`,
      createdAt: gift.createdAt,
      status: 'sent',
      giftAmount: gift.amount,
      purchaseEventId: gift.purchaseEventId,
    }));
    const recipientMessages: ThreadMessage[] = separateMessages.map((message) => ({
      key: message.id,
      direction: 'outgoing',
      kind: 'text',
      text: message.text,
      createdAt: message.createdAt,
      status: 'sent',
    }));
    return [...messages, ...gifts, ...recipientMessages].sort((a, b) => {
      if (a.serverSequence != null && b.serverSequence != null) {
        return a.serverSequence - b.serverSequence;
      }
      if (a.localSequence != null && b.localSequence != null) {
        return a.localSequence - b.localSequence;
      }
      return a.createdAt - b.createdAt;
    });
  }, [giftEffects, messages, separateMessages]);

  useEffect(() => {
    let active = true;
    if (!recipientId) return;
    const refresh = () => {
      void bulkMessageService.getMessagesForRecipients([recipientId]).then((records) => {
        if (active) setSeparateMessages(records);
      });
    };
    refresh();
    const unsubscribe = subscribeToBulkMessages(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [bulkMessageService, recipientId]);

  useEffect(() => {
    if (!isOnline) showToast('You are offline. New messages will wait safely on this device.', { kind: 'info' });
  }, [isOnline, showToast]);

  useEffect(() => {
    const failed = messages.find(({ status }) => status === 'failed');
    if (failed && failed.key !== lastFailedKey.current) {
      lastFailedKey.current = failed.key;
      showToast(failed.error?.message ?? 'Message failed to send.', {
        actionLabel: failed.error?.recoverable ? 'Retry' : undefined,
        kind: 'error',
        onAction: failed.error?.recoverable && failed.clientId ? () => void retry(failed.clientId!) : undefined,
      });
    }
  }, [messages, retry, showToast]);

  useEffect(() => {
    if (hasPaidAccess && !previouslyHadAccess.current) {
      messages
        .filter(({ error, status }) => status === 'failed' && error?.code === 'paid-access-required')
        .forEach(({ clientId }) => { if (clientId) void retry(clientId); });
    }
    previouslyHadAccess.current = hasPaidAccess;
  }, [hasPaidAccess, messages, retry]);

  const handleSend = useCallback(async () => {
    if (!text.trim() && !attachment) return;
    const nextText = text.trim();
    const nextAttachment = attachment;
    setText('');
    setAttachment(undefined);
    try {
      await send(nextText, nextAttachment);
    } catch {
      setText(nextText);
      setAttachment(nextAttachment);
      showToast('The message could not be queued. Your draft was restored.', { kind: 'error' });
    }
  }, [attachment, send, showToast, text]);

  const handlePickMedia = useCallback(async () => {
    try {
      const media = await pickAndPersistMedia();
      if (!media) return;
      setAttachment(media);
      showToast(`${media.type === 'video' ? 'Video' : 'Photo'} attached`, {
        kind: 'success',
      });
    } catch {
      showToast('Could not open or save this media file.', { kind: 'error' });
    }
  }, [showToast]);

  const renderItem = useCallback(({ item }: { item: ThreadMessage }) => {
    const outgoing = item.direction === 'outgoing';
    const action = item.status === 'failed'
      ? item.error?.recoverable && item.clientId
        ? () => void retry(item.clientId!)
        : () => open({ type: 'paywall', snapPoints: ['70%'] })
      : undefined;
    return (
      <View style={[styles.row, outgoing ? styles.outgoingRow : styles.incomingRow]}>
        {!outgoing ? <Avatar accessibilityLabel="Ethan Shoots avatar" size={28} source={avatar} /> : null}
        <ChatMessageBubble message={item} onAction={action} />
      </View>
    );
  }, [open, retry]);

  if (!isHydrated) return <View style={styles.center}><Text style={styles.empty}>Restoring conversation…</Text></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0} style={styles.container}>
      {!isOnline ? <View style={styles.offline}><Text style={styles.offlineText}>Offline · messages are saved locally</Text></View> : null}
      <FlashList
        data={thread}
        keyExtractor={(item) => item.key}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2, startRenderingFromBottom: true }}
        onStartReached={() => { if (hasOlderMessages && !isSyncing) void loadOlder(); }}
        onStartReachedThreshold={0.35}
        renderItem={renderItem}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No messages yet. Start the conversation.</Text></View>}
        ListHeaderComponent={<View style={styles.dayContainer}><Text style={styles.dayText}>Today</Text></View>}
        contentContainerStyle={styles.listContent}
      />
      <MessageComposer
        attachment={attachment}
        disabled={!hasPaidAccess}
        onAddPress={() =>
          open({
            type: 'messageActions',
            data: { onPickMedia: handlePickMedia },
            snapPoints: ['30%'],
          })
        }
        onChangeText={setText}
        onRemoveAttachment={() => setAttachment(undefined)}
        onSend={() => void handleSend()}
        onSubscribePress={() => open({ type: 'paywall', snapPoints: ['70%'] })}
        text={text}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 6 },
  outgoingRow: { justifyContent: 'flex-end' },
  incomingRow: { justifyContent: 'flex-start' },
  dayContainer: { alignItems: 'center', paddingVertical: 16 },
  dayText: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  center: { minHeight: 160, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, textAlign: 'center' },
  offline: { alignItems: 'center', backgroundColor: '#FEF3C7', paddingVertical: 5 },
  offlineText: { color: '#92400E', fontFamily: fontFamilies.sans, fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
});
