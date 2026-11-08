import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { PurchaseSimulationControls } from '@/components/PurchaseSimulationControls';
import { CloseIcon, GiftIcon } from '@/components/icons';
import { usePurchases } from '@/contexts/PurchaseContext';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export function GiftStoreModal({ close }: { close: () => void }) {
  const { billingStatus, currentProductId, error, giftEffects, products, purchase } =
    usePurchases();
  const previousGiftCount = useRef(giftEffects.length);
  const gifts = products.filter(({ type }) => type === 'consumable');
  const isBusy =
    billingStatus === 'confirming' ||
    billingStatus === 'purchasing' ||
    billingStatus === 'restoring';

  useEffect(() => {
    if (giftEffects.length > previousGiftCount.current) close();
    previousGiftCount.current = giftEffects.length;
  }, [close, giftEffects.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Send a gift</Text>
          <Text style={styles.simulated}>SIMULATED BILLING</Text>
        </View>
        <IconButton
          accessibilityLabel="Close gift store"
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
        <Text style={styles.description}>
          Choose a one-time gift. It appears in the thread only after backend confirmation.
        </Text>

        <View style={styles.giftGrid}>
          {gifts.map((gift) => {
            const buyingThis = isBusy && currentProductId === gift.id;
            return (
              <Pressable
                key={gift.id}
                accessibilityLabel={`Purchase ${gift.title}`}
                accessibilityRole="button"
                disabled={isBusy}
                onPress={() => void purchase(gift.id)}
                style={({ pressed }) => [
                  styles.giftCard,
                  pressed && styles.pressed,
                  isBusy && styles.disabled,
                ]}>
                <View style={styles.giftIcon}>
                  <GiftIcon height={24} width={24} />
                </View>
                <Text style={styles.giftTitle}>{gift.title}</Text>
                <Text style={styles.giftPrice}>{buyingThis ? 'Purchasing…' : gift.price}</Text>
              </Pressable>
            );
          })}
        </View>

        {billingStatus === 'confirming' ? (
          <Text style={styles.pending}>Paid. Waiting for backend confirmation before sending.</Text>
        ) : null}
        {billingStatus === 'cancelled' ? (
          <Text style={styles.pending}>The simulated purchase was cancelled.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

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
    color: colors.customSecondary500,
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    fontWeight: fontWeights.semibold,
  },
  content: { gap: 14, padding: 24, paddingBottom: 36 },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  giftGrid: { flexDirection: 'row', gap: 8 },
  giftCard: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  giftIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F0E9FF',
  },
  giftTitle: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  giftPrice: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
  },
  pending: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  error: {
    color: colors.destructive,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
});
