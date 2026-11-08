import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  MockPurchaseBackend,
  MockPurchaseService,
  PURCHASE_PRODUCTS,
  type Entitlement,
  type GiftEffect,
  type PurchaseOutcome,
  type PurchaseProduct,
} from '@/features/purchases';

export type BillingStatus =
  | 'idle'
  | 'purchasing'
  | 'cancelled'
  | 'failed'
  | 'confirming'
  | 'restoring'
  | 'success';

type PurchaseContextValue = {
  products: PurchaseProduct[];
  billingStatus: BillingStatus;
  currentProductId?: PurchaseProduct['id'];
  error?: string;
  entitlement: Entitlement | null;
  giftEffects: GiftEffect[];
  hasPaidAccess: boolean;
  pendingConfirmationCount: number;
  simulatedOutcome: PurchaseOutcome;
  isConfirmationDelayed: boolean;
  purchase: (productId: PurchaseProduct['id']) => Promise<void>;
  restore: () => Promise<void>;
  confirmPending: () => Promise<void>;
  resetBackendAccess: () => Promise<void>;
  resetPurchases: () => Promise<void>;
  setSimulatedOutcome: (outcome: PurchaseOutcome) => void;
  setConfirmationDelayed: (delayed: boolean) => void;
};

const PurchaseContext = createContext<PurchaseContextValue | undefined>(undefined);

export function usePurchases() {
  const context = useContext(PurchaseContext);
  if (!context) throw new Error('usePurchases must be used within PurchaseProvider');
  return context;
}

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const purchaseService = useMemo(() => new MockPurchaseService(AsyncStorage), []);
  const backend = useMemo(() => new MockPurchaseBackend(AsyncStorage), []);
  const purchaseInFlight = useRef(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatus>('idle');
  const [currentProductId, setCurrentProductId] = useState<PurchaseProduct['id']>();
  const [error, setError] = useState<string>();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [giftEffects, setGiftEffects] = useState<GiftEffect[]>([]);
  const [pendingConfirmationCount, setPendingConfirmationCount] = useState(0);
  const [simulatedOutcome, setSimulatedOutcome] = useState<PurchaseOutcome>('success');
  const [isConfirmationDelayed, setConfirmationDelayed] = useState(true);

  const refreshBackendState = useCallback(async () => {
    const snapshot = await backend.getSnapshot();
    setEntitlement(snapshot.entitlement);
    setGiftEffects(snapshot.gifts);
    setPendingConfirmationCount(snapshot.pendingCount);
    return snapshot;
  }, [backend]);

  useEffect(() => {
    const timeout = setTimeout(() => void refreshBackendState(), 0);
    return () => clearTimeout(timeout);
  }, [refreshBackendState]);

  const purchase = useCallback(
    async (productId: PurchaseProduct['id']) => {
      if (purchaseInFlight.current) return;

      purchaseInFlight.current = true;
      setCurrentProductId(productId);
      setBillingStatus('purchasing');
      setError(undefined);

      try {
        const result = await purchaseService.purchase(productId, simulatedOutcome);

        if (result.status === 'cancelled') {
          setBillingStatus('cancelled');
          return;
        }

        if (result.status === 'failed') {
          setBillingStatus('failed');
          setError(result.error);
          return;
        }

        setBillingStatus('confirming');
        const confirmation = await backend.confirm(result.receipt, {
          delayed: isConfirmationDelayed,
        });
        await refreshBackendState();
        setBillingStatus(confirmation.status === 'pending' ? 'confirming' : 'success');
      } catch {
        setBillingStatus('failed');
        setError('The simulated billing flow could not be completed.');
      } finally {
        purchaseInFlight.current = false;
      }
    }, [backend, isConfirmationDelayed, purchaseService, refreshBackendState, simulatedOutcome],
  );

  const restore = useCallback(async () => {
    if (purchaseInFlight.current) return;

    purchaseInFlight.current = true;
    setBillingStatus('restoring');
    setError(undefined);

    try {
      const receipts = await purchaseService.restore();
      for (const receipt of receipts) {
        await backend.confirm(receipt, { delayed: isConfirmationDelayed });
      }
      const snapshot = await refreshBackendState();
      setBillingStatus(
        !receipts.length ? 'idle' : snapshot.pendingCount > 0 ? 'confirming' : 'success',
      );
      if (!receipts.length) setError('No simulated purchases were found to restore.');
    } catch {
      setBillingStatus('failed');
      setError('The simulated purchases could not be restored.');
    } finally {
      purchaseInFlight.current = false;
    }
  }, [backend, isConfirmationDelayed, purchaseService, refreshBackendState]);

  const confirmPending = useCallback(async () => {
    setBillingStatus('confirming');
    await backend.confirmPending();
    await refreshBackendState();
    setBillingStatus('success');
  }, [backend, refreshBackendState]);

  const resetPurchases = useCallback(async () => {
    await Promise.all([purchaseService.reset(), backend.reset()]);
    setBillingStatus('idle');
    setCurrentProductId(undefined);
    setError(undefined);
    await refreshBackendState();
  }, [backend, purchaseService, refreshBackendState]);

  const resetBackendAccess = useCallback(async () => {
    await backend.reset();
    setBillingStatus('idle');
    setCurrentProductId(undefined);
    setError(undefined);
    await refreshBackendState();
  }, [backend, refreshBackendState]);

  const value = useMemo<PurchaseContextValue>(
    () => ({
      billingStatus,
      confirmPending,
      currentProductId,
      entitlement,
      error,
      giftEffects,
      hasPaidAccess: Boolean(entitlement),
      isConfirmationDelayed,
      pendingConfirmationCount,
      products: PURCHASE_PRODUCTS,
      purchase,
      resetBackendAccess,
      resetPurchases,
      restore,
      setConfirmationDelayed,
      setSimulatedOutcome,
      simulatedOutcome,
    }),
    [
      billingStatus,
      confirmPending,
      currentProductId,
      entitlement,
      error,
      giftEffects,
      isConfirmationDelayed,
      pendingConfirmationCount,
      purchase,
      resetBackendAccess,
      resetPurchases,
      restore,
      simulatedOutcome,
    ],
  );

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}
