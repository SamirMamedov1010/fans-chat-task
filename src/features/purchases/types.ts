export type PurchaseProduct = {
  id: 'fan-chat-monthly' | 'gift-5' | 'gift-25' | 'gift-50';
  type: 'subscription' | 'consumable';
  title: string;
  price: string;
  giftAmount?: number;
};

export const PURCHASE_PRODUCTS: PurchaseProduct[] = [
  {
    id: 'fan-chat-monthly',
    type: 'subscription',
    title: 'Fan Chat Access',
    price: '$9.99 / month',
  },
  { id: 'gift-5', type: 'consumable', title: '$5 Gift', price: '$5.00', giftAmount: 5 },
  { id: 'gift-25', type: 'consumable', title: '$25 Gift', price: '$25.00', giftAmount: 25 },
  { id: 'gift-50', type: 'consumable', title: '$50 Gift', price: '$50.00', giftAmount: 50 },
];

export type PurchaseOutcome = 'success' | 'cancelled' | 'failed';

export type PurchaseReceipt = {
  eventId: string;
  productId: PurchaseProduct['id'];
  purchasedAt: number;
};

export type BillingResult =
  | { status: 'success'; receipt: PurchaseReceipt }
  | { status: 'cancelled' }
  | { status: 'failed'; error: string };

export type Entitlement = {
  productId: 'fan-chat-monthly';
  sourceEventId: string;
  expiresAt: number;
};

export type GiftEffect = {
  effectId: string;
  purchaseEventId: string;
  amount: number;
  createdAt: number;
};

export type BackendConfirmation =
  | { status: 'pending' }
  | { status: 'confirmed'; gift?: GiftEffect };

export type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
