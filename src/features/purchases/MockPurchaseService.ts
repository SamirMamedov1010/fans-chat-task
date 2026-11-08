import type {
  BillingResult,
  KeyValueStorage,
  PurchaseOutcome,
  PurchaseProduct,
  PurchaseReceipt,
} from './types';

const RECEIPTS_KEY = 'mock-billing:receipts';

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

function createEventId() {
  return `purchase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export class MockPurchaseService {
  private isPurchaseInFlight = false;

  constructor(private readonly storage: KeyValueStorage) {}

  async purchase(
    productId: PurchaseProduct['id'],
    outcome: PurchaseOutcome,
  ): Promise<BillingResult> {
    if (this.isPurchaseInFlight) {
      return { status: 'failed', error: 'A purchase is already in progress.' };
    }

    this.isPurchaseInFlight = true;

    try {
      await wait(350);

      if (outcome === 'cancelled') return { status: 'cancelled' };
      if (outcome === 'failed') {
        return { status: 'failed', error: 'The simulated store declined this purchase.' };
      }

      const receipt: PurchaseReceipt = {
        eventId: createEventId(),
        productId,
        purchasedAt: Date.now(),
      };
      const receipts = await this.restore();
      await this.storage.setItem(RECEIPTS_KEY, JSON.stringify([...receipts, receipt]));

      return { status: 'success', receipt };
    } finally {
      this.isPurchaseInFlight = false;
    }
  }

  async restore(): Promise<PurchaseReceipt[]> {
    const value = await this.storage.getItem(RECEIPTS_KEY);
    return value ? (JSON.parse(value) as PurchaseReceipt[]) : [];
  }

  async reset() {
    await this.storage.removeItem(RECEIPTS_KEY);
  }
}
