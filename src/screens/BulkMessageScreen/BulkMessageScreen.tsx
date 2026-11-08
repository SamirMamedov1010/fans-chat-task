import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { BackIcon, CloseIcon, SendIcon } from '@/components/icons';
import { useBottomSheet } from '@/contexts/BottomSheetContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useToast } from '@/contexts/ToastContext';
import {
  MockBulkMessageService,
  resolveSelectedUsers,
} from '@/features/contacts';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const avatar = require('@/assets/images/avatar.png');
const MAX_MESSAGE_LENGTH = 400;

type SentBatch = { batchId: string; createdAt: number; text: string };

export function BulkMessageScreen() {
  const { recipientIds: recipientIdsParam } = useLocalSearchParams<{
    recipientIds?: string | string[];
  }>();
  const insets = useSafeAreaInsets();
  const { open } = useBottomSheet();
  const { hasPaidAccess } = usePurchases();
  const { showToast } = useToast();
  const service = useMemo(() => new MockBulkMessageService(AsyncStorage), []);
  const selectedIds = useMemo(() => {
    const value = Array.isArray(recipientIdsParam) ? recipientIdsParam[0] : recipientIdsParam;
    return value?.split(',').filter(Boolean) ?? [];
  }, [recipientIdsParam]);
  const recipients = useMemo(() => resolveSelectedUsers(selectedIds), [selectedIds]);
  const recipientIds = useMemo(() => recipients.map(({ id }) => id), [recipients]);
  const [text, setText] = useState('');
  const [sentBatches, setSentBatches] = useState<SentBatch[]>([]);

  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !recipients.length) return;
    if (!hasPaidAccess) {
      open({ type: 'paywall', snapPoints: ['70%'] });
      return;
    }

    const records = await service.sendSeparately(recipientIds, trimmedText);
    const firstRecord = records[0];
    if (!firstRecord) return;
    setSentBatches((current) => [
      ...current,
      { batchId: firstRecord.batchId, createdAt: firstRecord.createdAt, text: trimmedText },
    ]);
    setText('');
    showToast(`Sent separately to ${records.length} users.`, { kind: 'success' });
  }, [hasPaidAccess, open, recipientIds, recipients.length, service, showToast, text]);

  const renderMessage = ({ item }: { item: SentBatch }) => (
    <View style={styles.messageBubble}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>Now · sent separately to {recipients.length}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={10} onPress={() => router.back()}>
          <BackIcon />
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>
          Separate Message to ({recipients.length}) users
        </Text>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" hitSlop={10} onPress={() => router.replace('/chats')}>
          <CloseIcon />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.recipientsContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recipients}>
        {recipients.map((recipient) => (
          <View key={recipient.id} style={styles.recipientChip}>
            <Avatar accessibilityLabel={`${recipient.name} avatar`} size={28} source={avatar} />
            <View>
              <Text numberOfLines={1} style={styles.recipientName}>{recipient.name}</Text>
              <Text numberOfLines={1} style={styles.recipientUsername}>{recipient.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <FlatList
          contentContainerStyle={styles.messages}
          data={sentBatches}
          keyExtractor={({ batchId }) => batchId}
          keyboardShouldPersistTaps="handled"
          renderItem={renderMessage}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputContainer}>
            <TextInput
              accessibilityLabel="Separate message"
              maxLength={MAX_MESSAGE_LENGTH}
              multiline
              onChangeText={setText}
              placeholder="Write one message to send separately..."
              placeholderTextColor={colors.mutedForeground}
              selectionColor={colors.primary}
              style={styles.input}
              value={text}
            />
          </View>
          <Pressable
            accessibilityLabel="Send separate messages"
            accessibilityRole="button"
            disabled={!text.trim() || !recipients.length}
            onPress={() => void handleSend()}
            style={({ pressed }) => [
              styles.sendButton,
              (!text.trim() || !recipients.length) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <SendIcon />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16 },
  title: { flex: 1, color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  recipients: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  recipientsContent: { gap: 8, padding: 12 },
  recipientChip: { width: 144, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: colors.messageOutgoing, padding: 8 },
  recipientName: { maxWidth: 90, color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
  recipientUsername: { maxWidth: 90, color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: 10 },
  body: { flex: 1 },
  messages: { flexGrow: 1, justifyContent: 'flex-end', gap: 10, padding: 16 },
  messageBubble: { maxWidth: '82%', alignSelf: 'flex-end', borderRadius: 16, backgroundColor: colors.messageOutgoing, padding: 12 },
  messageText: { color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, lineHeight: lineHeights.sm },
  messageTime: { marginTop: 5, color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 10 },
  inputContainer: { minHeight: 40, flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: colors.input, borderRadius: 10, paddingHorizontal: 12 },
  input: { maxHeight: 96, color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, lineHeight: lineHeights.sm, paddingVertical: 9 },
  sendButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
});
