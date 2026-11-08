import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GiftIcon, PlusIcon } from '@/components/icons';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export type MessageActionsModalProps = {
  close: () => void;
  onGiftPress: () => void;
  onPickMedia?: () => Promise<void>;
};

export function MessageActionsModal({ close, onGiftPress, onPickMedia }: MessageActionsModalProps) {
  const pickMedia = () => {
    close();
    setTimeout(() => void onPickMedia?.(), 220);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add to message</Text>
      <Pressable accessibilityRole="button" onPress={pickMedia} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <View style={styles.icon}><PlusIcon color={colors.primary} height={18} width={18} /></View>
        <View><Text style={styles.actionTitle}>Photo or video</Text><Text style={styles.subtitle}>Choose from your media library</Text></View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onGiftPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <View style={styles.icon}><GiftIcon height={20} width={20} /></View>
        <View><Text style={styles.actionTitle}>Send a gift</Text><Text style={styles.subtitle}>One-time simulated purchase</Text></View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, padding: 24 },
  title: { marginBottom: 4, color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, lineHeight: lineHeights.md },
  action: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14 },
  icon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.customPrimary100 },
  actionTitle: { color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  subtitle: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  pressed: { opacity: 0.65 },
});
