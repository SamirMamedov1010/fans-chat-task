import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { PurchaseSimulationControls } from '@/components/PurchaseSimulationControls';
import { CloseIcon, StarIcon } from '@/components/icons';
import { usePurchases } from '@/contexts/PurchaseContext';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export function PaywallModal({ close }: { close: () => void }) {
  const {
    billingStatus,
    entitlement,
    error,
    products,
    purchase,
    restore,
  } = usePurchases();
  const previouslyHadEntitlement = useRef(Boolean(entitlement));
  const product = products.find(({ type }) => type === 'subscription');
  const isBusy =
    billingStatus === 'confirming' ||
    billingStatus === 'purchasing' ||
    billingStatus === 'restoring';

  useEffect(() => {
    if (entitlement && !previouslyHadEntitlement.current) close();
    previouslyHadEntitlement.current = Boolean(entitlement);
  }, [close, entitlement]);

  if (!product) return null;

  const statusText = entitlement
    ? 'Paid access confirmed by the mock backend.'
    : billingStatus === 'confirming'
      ? 'Purchase succeeded. Waiting for backend confirmation.'
      : billingStatus === 'cancelled'
        ? 'The simulated purchase was cancelled.'
        : error;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Paid chat access</Text>
          <Text style={styles.simulated}>SIMULATED BILLING</Text>
        </View>
        <IconButton
          accessibilityLabel="Close paywall"
          backgroundColor={colors.secondary}
          icon={CloseIcon}
          onPress={close}
          size={32}
          withInsetShadow={false}
        />
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <StarIcon height={24} width={24} />
          </View>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.description}>
            Unlock sending messages. Access starts only after backend confirmation.
          </Text>
        </View>

        {statusText ? (
          <View style={[styles.status, entitlement && styles.statusSuccess]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isBusy || Boolean(entitlement)}
          onPress={() => void purchase(product.id)}
          style={[styles.primaryButton, (isBusy || entitlement) && styles.disabled]}>
          <Text style={styles.primaryButtonText}>
            {entitlement
              ? 'Access active'
              : billingStatus === 'purchasing'
                ? 'Purchasing…'
                : billingStatus === 'confirming'
                  ? 'Awaiting confirmation…'
                : 'Subscribe'}
          </Text>
        </Pressable>

        <Pressable accessibilityRole="button" disabled={isBusy} onPress={() => void restore()}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>

        <PurchaseSimulationControls />
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.md,
  },
  simulated: {
    marginTop: 2,
    color: colors.customSecondary500,
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: fontWeights.semibold,
  },
  content: { gap: 14, padding: 24, paddingBottom: 40 },
  productCard: {
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
  },
  productIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.customPrimary100,
  },
  productTitle: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  price: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    textAlign: 'center',
  },
  status: { borderRadius: 10, backgroundColor: '#FFF7ED', padding: 10 },
  statusSuccess: { backgroundColor: '#F0FDF4' },
  statusText: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  primaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.background,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  disabled: { opacity: 0.5 },
  restoreText: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
});
