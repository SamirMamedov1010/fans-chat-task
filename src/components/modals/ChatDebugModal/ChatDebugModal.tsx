import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useConversationChat } from '@/contexts/ChatContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useToast } from '@/contexts/ToastContext';
import type { SendFailureMode } from '@/features/chat';
import { MockBulkMessageService } from '@/features/contacts';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const failureModes: { label: string; value: SendFailureMode }[] = [
  { label: 'Normal', value: 'none' },
  { label: 'Lost response', value: 'response-lost' },
  { label: 'Server failure', value: 'temporary' },
];

export function ChatDebugModal({ chatId, close }: { chatId: string; close: () => void }) {
  const { isOnline, resetChat, seedHistory, sendFailureMode, setNextFailure, setOnline, simulateIncoming } = useConversationChat(chatId);
  const { resetBackendAccess, resetPurchases } = usePurchases();
  const { showToast } = useToast();
  const resetConversation = async () => {
    await Promise.all([
      resetChat(),
      new MockBulkMessageService(AsyncStorage).removeMessagesForRecipient(chatId),
    ]);
  };

  const run = async (action: () => Promise<void>, success: string) => {
    try { await action(); showToast(success, { kind: 'success' }); }
    catch { showToast('The debug action failed.', { kind: 'error' }); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Chat test controls</Text><Pressable accessibilityRole="button" onPress={close}><Text style={styles.close}>Close</Text></Pressable></View>
      <View style={styles.row}><View><Text style={styles.label}>Connection</Text><Text style={styles.note}>{isOnline ? 'Online' : 'Offline — sends stay queued'}</Text></View><Switch accessibilityLabel="Toggle mock connection" onValueChange={(value) => void setOnline(value)} value={isOnline} /></View>
      <Text style={styles.label}>Next send result</Text>
      <View style={styles.segment}>{failureModes.map((mode) => <Pressable key={mode.value} onPress={() => setNextFailure(mode.value)} style={[styles.segmentItem, sendFailureMode === mode.value && styles.segmentSelected]}><Text style={[styles.segmentText, sendFailureMode === mode.value && styles.segmentTextSelected]}>{mode.label}</Text></Pressable>)}</View>
      <View style={styles.actions}>
        <Action label="Simulate 4 incoming messages" onPress={() => void run(() => simulateIncoming(4), 'Four incoming messages added')} />
        <Action label="Generate repeatable 50,000-message history" onPress={() => void run(() => seedHistory(50_000), '50,000-message history generated')} />
        <Action
          danger
          label="Reset chat and local queue"
          onPress={() => void run(resetConversation, 'Chat and local queue reset')}
        />
        <Action
          label="Reset backend access only"
          onPress={() =>
            void run(
              resetBackendAccess,
              'Backend access reset. Store receipts remain available to restore.',
            )
          }
        />
        <Action danger label="Reset simulated purchases" onPress={() => void run(resetPurchases, 'Purchases reset')} />
      </View>
    </View>
  );
}

function Action({ danger, label, onPress }: { danger?: boolean; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={[styles.actionText, danger && styles.danger]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, lineHeight: lineHeights.md },
  close: { color: colors.primary, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  note: { marginTop: 3, color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  segment: { flexDirection: 'row', borderRadius: 10, backgroundColor: colors.secondary, padding: 3 },
  segmentItem: { flex: 1, alignItems: 'center', borderRadius: 8, paddingVertical: 8 },
  segmentSelected: { backgroundColor: colors.primary },
  segmentText: { color: colors.textSecondary, fontFamily: fontFamilies.sans, fontSize: fontSizes.xs },
  segmentTextSelected: { color: colors.background },
  actions: { gap: 8 },
  action: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12 },
  actionText: { color: colors.foreground, fontFamily: fontFamilies.sans, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  danger: { color: colors.destructive },
  pressed: { opacity: 0.65 },
});
