import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GiftIcon } from '@/components/icons';
import type { ThreadMessage } from '@/features/chat';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export type ChatMessageBubbleProps = { message: ThreadMessage; onAction?: () => void };

function formatMessageTime(createdAt: number) {
  return new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export const ChatMessageBubble = memo(function ChatMessageBubble({ message, onAction }: ChatMessageBubbleProps) {
  const isGift = message.kind === 'gift';
  const statusLabel = message.status === 'queued' ? 'Waiting for connection…' : message.status === 'sending' ? 'Sending…' : message.status === 'failed' ? message.error?.message ?? 'Could not send.' : undefined;

  return (
    <View style={[styles.bubble, message.direction === 'outgoing' ? styles.outgoingBubble : styles.incomingBubble]}>
      {message.media?.type === 'image' ? <Image contentFit="cover" source={{ uri: message.media.uri }} style={styles.media} /> : null}
      {message.media?.type === 'video' ? <View style={styles.video}><Text style={styles.videoText}>▶ {message.media.name}</Text></View> : null}
      {isGift ? (
        <View style={styles.giftContent}><View style={styles.giftIconContainer}><GiftIcon /></View><Text style={styles.messageText}>{message.text}</Text></View>
      ) : message.text ? <Text style={styles.messageText}>{message.text}</Text> : null}
      <View style={styles.meta}>
        <Text style={styles.time}>{formatMessageTime(message.createdAt)}</Text>
        {statusLabel ? <Text style={message.status === 'failed' ? styles.failed : styles.status}>{statusLabel}</Text> : null}
        {message.status === 'failed' && onAction ? <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}><Text style={styles.retry}>{message.error?.recoverable ? 'Retry' : 'Subscribe'}</Text></Pressable> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: { maxWidth: 292, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  incomingBubble: { backgroundColor: colors.secondary },
  outgoingBubble: { backgroundColor: colors.messageOutgoing },
  giftContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  giftIconContainer: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.customPrimary100, borderRadius: 10, backgroundColor: colors.background, boxShadow: `inset 0 -2px 4px ${colors.customSecondary500}` },
  messageText: { flexShrink: 1, color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.regular, lineHeight: lineHeights.sm },
  media: { width: 260, height: 190, marginBottom: 8, borderRadius: 12, backgroundColor: colors.secondary },
  video: { minHeight: 72, justifyContent: 'center', marginBottom: 8, borderRadius: 12, backgroundColor: colors.customPrimary100, padding: 12 },
  videoText: { color: colors.primary, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 },
  time: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  status: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  failed: { color: colors.destructive, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  retry: { color: colors.primary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold },
});
