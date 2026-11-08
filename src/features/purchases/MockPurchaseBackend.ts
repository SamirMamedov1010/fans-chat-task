import { getPurchaseProduct } from './products';
import type {
  BackendConfirmation,
  Entitlement,
  GiftEffect,
  KeyValueStorage,
  PurchaseReceipt,
} from './types';

const BACKEND_KEY = 'mock-backend:purchases';

type ProcessedEvent = {
  kind: 'gift' | 'subscription';
  giftEffectId?: string;
};

type BackendState = {
  entitlement: Entitlement | null;
  gifts: GiftEffect[];
  pending: PurchaseReceipt[];
  processed: Record<string, ProcessedEvent>;
};

const createInitialState = (): BackendState => ({
  entitlement: null,
  gifts: [],
  pending: [],
  processed: {},
});

export class MockPurchaseBackend {
  constructor(private readonly storage: KeyValueStorage) {}

  private async read(): Promise<BackendState> {
    const value = await this.storage.getItem(BACKEND_KEY);
    return value ? (JSON.parse(value) as BackendState) : createInitialState();
  }

  private async write(state: BackendState) {
    await this.storage.setItem(BACKEND_KEY, JSON.stringify(state));
  }

  private processReceipt(state: BackendState, receipt: PurchaseReceipt): GiftEffect | undefined {
    const existing = state.processed[receipt.eventId];
    if (existing) {
      return existing.giftEffectId
        ? state.gifts.find(({ effectId }) => effectId === existing.giftEffectId)
        : undefined;
    }

    const product = getPurchaseProduct(receipt.productId);

    if (product.type === 'subscription') {
      state.entitlement = {
        productId: 'fan-chat-monthly',
        sourceEventId: receipt.eventId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      state.processed[receipt.eventId] = { kind: 'subscription' };
      return undefined;
    }

    const gift: GiftEffect = {
      effectId: `gift-${receipt.eventId}`,
      purchaseEventId: receipt.eventId,
      amount: product.giftAmount ?? 0,
      createdAt: Date.now(),
    };
    state.gifts.push(gift);
    state.processed[receipt.eventId] = { kind: 'gift', giftEffectId: gift.effectId };
    return gift;
  }

  async confirm(
    receipt: PurchaseReceipt,
    options: { delayed: boolean },
  ): Promise<BackendConfirmation> {
    const state = await this.read();
    const processed = state.processed[receipt.eventId];

    if (processed) {
      return {
        status: 'confirmed',
        gift: processed.giftEffectId
          ? state.gifts.find(({ effectId }) => effectId === processed.giftEffectId)
          : undefined,
      };
    }

    if (options.delayed) {
      if (!state.pending.some(({ eventId }) => eventId === receipt.eventId)) {
        state.pending.push(receipt);
        await this.write(state);
      }
      return { status: 'pending' };
    }

    state.pending = state.pending.filter(({ eventId }) => eventId !== receipt.eventId);
    const gift = this.processReceipt(state, receipt);
    await this.write(state);
    return { status: 'confirmed', gift };
  }

  async confirmPending() {
    const state = await this.read();
    const pending = [...state.pending];
    state.pending = [];

    for (const receipt of pending) this.processReceipt(state, receipt);

    await this.write(state);
    return this.getSnapshot();
  }

  async getSnapshot() {
    const state = await this.read();
    const entitlement =
      state.entitlement && state.entitlement.expiresAt > Date.now() ? state.entitlement : null;

    return {
      entitlement,
      gifts: state.gifts,
      pendingCount: state.pending.length,
    };
  }

  async reset() {
    await this.storage.removeItem(BACKEND_KEY);
  }
}
