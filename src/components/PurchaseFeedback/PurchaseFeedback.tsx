import { useEffect, useRef } from 'react';

import { usePurchases, type BillingStatus } from '@/contexts/PurchaseContext';
import { useToast } from '@/contexts/ToastContext';

export function PurchaseFeedback() {
  const { billingStatus, currentProductId, error, pendingConfirmationCount } = usePurchases();
  const { showToast } = useToast();
  const previous = useRef<BillingStatus>('idle');

  useEffect(() => {
    if (previous.current === billingStatus) return;
    previous.current = billingStatus;

    if (billingStatus === 'cancelled') {
      showToast('Purchase cancelled. No charge was made.', { kind: 'info' });
    } else if (billingStatus === 'failed') {
      showToast(error ?? 'The simulated purchase failed.', { kind: 'error' });
    } else if (billingStatus === 'confirming' && pendingConfirmationCount > 0) {
      showToast('Payment succeeded. Waiting for backend confirmation.', { kind: 'info' });
    } else if (billingStatus === 'success') {
      showToast(currentProductId?.startsWith('gift-') ? 'Gift confirmed and added to the chat.' : 'Paid chat access confirmed.', { kind: 'success' });
    }
  }, [billingStatus, currentProductId, error, pendingConfirmationCount, showToast]);

  return null;
}
