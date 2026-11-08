import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePurchases } from '@/contexts/PurchaseContext';
import type { PurchaseOutcome } from '@/features/purchases';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const outcomes: PurchaseOutcome[] = ['success', 'cancelled', 'failed'];

export function PurchaseSimulationControls() {
  const {
    confirmPending,
    isConfirmationDelayed,
    pendingConfirmationCount,
    setConfirmationDelayed,
    setSimulatedOutcome,
    simulatedOutcome,
  } = usePurchases();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Simulated billing</Text>
      <View style={styles.outcomes}>
        {outcomes.map((outcome) => {
          const selected = outcome === simulatedOutcome;
          return (
            <Pressable
              key={outcome}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setSimulatedOutcome(outcome)}
              style={[styles.option, selected && styles.optionSelected]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {outcome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: isConfirmationDelayed }}
        onPress={() => setConfirmationDelayed(!isConfirmationDelayed)}
        style={styles.delayRow}>
        <View style={[styles.switch, isConfirmationDelayed && styles.switchEnabled]}>
          <View style={[styles.switchThumb, isConfirmationDelayed && styles.switchThumbEnabled]} />
        </View>
        <Text style={styles.delayText}>Delay backend confirmation</Text>
      </Pressable>

      {pendingConfirmationCount ? (
        <Pressable accessibilityRole="button" onPress={() => void confirmPending()} style={styles.confirmButton}>
          <Text style={styles.confirmText}>Confirm pending ({pendingConfirmationCount})</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    padding: 12,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm,
    textTransform: 'uppercase',
  },
  outcomes: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 8,
    backgroundColor: colors.background,
    paddingVertical: 7,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.customPrimary100,
  },
  optionText: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: colors.primary,
  },
  delayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switch: {
    width: 36,
    height: 20,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.disabled,
    paddingHorizontal: 2,
  },
  switchEnabled: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  switchThumbEnabled: {
    alignSelf: 'flex-end',
  },
  delayText: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingVertical: 8,
  },
  confirmText: {
    color: colors.background,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
});
