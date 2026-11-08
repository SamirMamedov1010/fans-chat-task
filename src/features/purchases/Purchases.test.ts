import { MemoryStorage } from '@/test/MemoryStorage';

import { MockPurchaseBackend } from './MockPurchaseBackend';
import { MockPurchaseService } from './MockPurchaseService';

describe('simulated purchase confirmation', () => {
  test('does not grant access until a successful store result is confirmed by the backend', async () => {
    const storage = new MemoryStorage();
    const billing = new MockPurchaseService(storage);
    const backend = new MockPurchaseBackend(storage);
    const result = await billing.purchase('fan-chat-monthly', 'success');
    if (result.status !== 'success') throw new Error('Expected a successful simulated purchase');

    await backend.confirm(result.receipt, { delayed: true });
    expect((await backend.getSnapshot()).entitlement).toBeNull();
    expect((await backend.getSnapshot()).pendingCount).toBe(1);

    await backend.confirmPending();
    expect((await backend.getSnapshot()).entitlement?.productId).toBe('fan-chat-monthly');
  });

  test('repeated confirmation of one consumable produces one gift effect', async () => {
    const storage = new MemoryStorage();
    const backend = new MockPurchaseBackend(storage);
    const receipt = { eventId: 'gift-event', productId: 'gift-50' as const, purchasedAt: 123 };

    await backend.confirm(receipt, { delayed: false });
    await backend.confirm(receipt, { delayed: false });

    expect((await backend.getSnapshot()).gifts).toHaveLength(1);
  });

  test('restores a persisted store receipt after backend access is reset', async () => {
    const storage = new MemoryStorage();
    const billing = new MockPurchaseService(storage);
    const backend = new MockPurchaseBackend(storage);
    const result = await billing.purchase('fan-chat-monthly', 'success');
    if (result.status !== 'success') throw new Error('Expected a successful simulated purchase');

    await backend.confirm(result.receipt, { delayed: false });
    expect((await backend.getSnapshot()).entitlement).not.toBeNull();

    await backend.reset();
    expect((await backend.getSnapshot()).entitlement).toBeNull();

    const receipts = await billing.restore();
    expect(receipts).toHaveLength(1);
    await backend.confirm(receipts[0], { delayed: false });
    expect((await backend.getSnapshot()).entitlement?.productId).toBe('fan-chat-monthly');
  });
});
