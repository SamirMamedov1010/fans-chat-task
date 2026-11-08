import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoreHorizontalIcon, PlusIcon, RemoveAttachmentIcon, SendIcon } from '@/components/icons';
import type { MediaAttachment } from '@/features/chat';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const MAX_MESSAGE_LENGTH = 400;
const reactions = ['🔥', '❤️', '😍', '💋', '🥵', '🥺'];

export type MessageComposerProps = {
  attachment?: MediaAttachment;
  disabled?: boolean;
  onAddPress: () => void;
  onChangeText: (text: string) => void;
  onRemoveAttachment: () => void;
  onSend: () => void;
  onSubscribePress?: () => void;
  text: string;
};

export function MessageComposer({ attachment, disabled, onAddPress, onChangeText, onRemoveAttachment, onSend, onSubscribePress, text }: MessageComposerProps) {
  const insets = useSafeAreaInsets();
  const canSend = !disabled && Boolean(text.trim() || attachment);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {disabled ? (
        <Pressable accessibilityRole="button" onPress={onSubscribePress} style={({ pressed }) => [styles.locked, pressed && styles.pressed]}>
          <Text style={styles.lockedText}>Subscribe to send messages</Text>
        </Pressable>
      ) : null}

      <View style={styles.reactionsBar}>
        {reactions.map((reaction) => (
          <Pressable
            key={reaction}
            accessibilityLabel={`Add ${reaction} to message`}
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => onChangeText(`${text}${reaction}`.slice(0, MAX_MESSAGE_LENGTH))}
            style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.reaction}>{reaction}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityLabel="Show more reactions" accessibilityRole="button" hitSlop={6} style={({ pressed }) => [styles.moreReactions, pressed && styles.pressed]}>
          <MoreHorizontalIcon />
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Pressable accessibilityLabel="Add media or send a gift" accessibilityRole="button" hitSlop={8} onPress={onAddPress} style={({ pressed }) => [styles.addAttachment, pressed && styles.pressed]}>
            <PlusIcon color={colors.background} height={10} width={10} />
          </Pressable>
          <TextInput accessibilityLabel="Message" maxLength={MAX_MESSAGE_LENGTH} multiline onChangeText={onChangeText} placeholder="Start typing..." placeholderTextColor={colors.mutedForeground} selectionColor={colors.primary} style={styles.input} value={text} />
          {attachment ? (
            <View style={styles.attachmentChip}>
              {attachment.type === 'image' ? (
                <Image
                  contentFit="cover"
                  source={{ uri: attachment.uri }}
                  style={styles.attachmentPreview}
                />
              ) : (
                <View style={styles.attachmentPreview} />
              )}
              <Text numberOfLines={1} style={styles.attachmentName}>{attachment.name}</Text>
              <Pressable accessibilityLabel={`Remove ${attachment.name}`} accessibilityRole="button" hitSlop={6} onPress={onRemoveAttachment}>
                <RemoveAttachmentIcon />
              </Pressable>
            </View>
          ) : null}
        </View>
        <Pressable accessibilityLabel="Send message" accessibilityRole="button" disabled={!canSend} onPress={onSend} style={({ pressed }) => [styles.sendButton, !canSend && styles.sendButtonDisabled, pressed && styles.pressed]}>
          <SendIcon />
        </Pressable>
      </View>
      <Text style={styles.counter}>{text.length}/{MAX_MESSAGE_LENGTH}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, borderTopWidth: 1, borderTopColor: colors.border, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background, paddingTop: 12, paddingHorizontal: 16 },
  reactionsBar: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, backgroundColor: colors.secondary, paddingHorizontal: 12 },
  reaction: { fontSize: 16, lineHeight: 20 },
  moreReactions: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputContainer: { minWidth: 0, minHeight: 36, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.input, borderRadius: 8, backgroundColor: colors.background, paddingHorizontal: 10 },
  addAttachment: { width: 14, height: 14, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: colors.mutedForeground },
  input: { minWidth: 54, maxHeight: 88, flex: 1, color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.regular, lineHeight: lineHeights.sm, paddingHorizontal: 0, paddingVertical: 8 },
  attachmentChip: { width: 116, flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, backgroundColor: colors.secondary, paddingHorizontal: 4, paddingVertical: 3 },
  attachmentPreview: { width: 24, height: 24, flexShrink: 0, borderRadius: 4, backgroundColor: colors.primary },
  attachmentName: { minWidth: 0, flexShrink: 1, color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs, lineHeight: fontSizes.sm },
  sendButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary, boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1)' },
  sendButtonDisabled: { opacity: 0.45 },
  locked: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary },
  lockedText: { color: colors.background, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  counter: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs, lineHeight: fontSizes.sm },
  pressed: { opacity: 0.65 },
});
