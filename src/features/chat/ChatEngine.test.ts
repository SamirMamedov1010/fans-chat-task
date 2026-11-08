import { MockPurchaseBackend, type PurchaseReceipt } from '@/features/purchases';
import { MemoryStorage } from '@/test/MemoryStorage';

import { ChatEngine } from './ChatEngine';
import { ChatServiceError, MockChatService } from './MockChatService';

async function grantPaidAccess(storage: MemoryStorage) {
  const receipt: PurchaseReceipt = {
    eventId: 'subscription-for-chat-tests',
    productId: 'fan-chat-monthly',
    purchasedAt: Date.now(),
  };
  await new MockPurchaseBackend(storage).confirm(receipt, { delayed: false });
}

describe('durable and idempotent chat sends', () => {
  test('keeps messages isolated between user conversations', async () => {
    const storage = new MemoryStorage();
    await grantPaidAccess(storage);
    const ethan = new MockChatService(storage, 'user-1');
    const alex = new MockChatService(storage, 'user-2');

    await ethan.send({ clientId: 'ethan-message', createdAt: 100, text: 'Only for Ethan' });
    await alex.send({ clientId: 'alex-message', createdAt: 200, text: 'Only for Alex' });

    expect((await ethan.getAfter(0)).map(({ text }) => text)).toEqual(['Only for Ethan']);
    expect((await alex.getAfter(0)).map(({ text }) => text)).toEqual(['Only for Alex']);
  });

  test('a retry after an accepted send with a lost response creates one server message', async () => {
    const storage = new MemoryStorage();
    await grantPaidAccess(storage);
    const service = new MockChatService(storage);
    const input = { clientId: 'stable-client-id', createdAt: 123, text: 'Only once' };

    service.setNextFailure('response-lost');
    await expect(service.send(input)).rejects.toMatchObject<Partial<ChatServiceError>>({
      code: 'response-lost',
    });

    const recovered = await service.send(input);
    const serverMessages = await service.getAfter(0);

    expect(recovered.clientId).toBe(input.clientId);
    expect(serverMessages.filter(({ clientId }) => clientId === input.clientId)).toHaveLength(1);
  });

  test('keeps a reset conversation empty after app restart and reconnect', async () => {
    const storage = new MemoryStorage();
    const firstEngine = new ChatEngine(storage, new MockChatService(storage, 'user-reset'));
    await firstEngine.initialize();
    expect(firstEngine.getSnapshot().messages.length).toBeGreaterThan(0);

    await firstEngine.reset();
    expect(firstEngine.getSnapshot().messages).toEqual([]);

    const restartedEngine = new ChatEngine(
      storage,
      new MockChatService(storage, 'user-reset'),
    );
    await restartedEngine.initialize();
    await restartedEngine.reconnect();

    expect(restartedEngine.getSnapshot().messages).toEqual([]);
  });

  test('restores three queued sends after restart, syncs four incoming, and sends without duplicates', async () => {
    const storage = new MemoryStorage();
    await grantPaidAccess(storage);

    const firstService = new MockChatService(storage);
    const firstEngine = new ChatEngine(storage, firstService);
    await firstEngine.setOnline(false);
    await firstEngine.initialize();
    await firstEngine.send('offline one');
    await firstEngine.send('offline two');
    await firstEngine.send('offline three');
    await firstEngine.simulateIncoming(4);

    const restartedService = new MockChatService(storage);
    const restartedEngine = new ChatEngine(storage, restartedService);
    await restartedEngine.initialize();
    expect(restartedEngine.getSnapshot().isOnline).toBe(false);
    expect(restartedEngine.getSnapshot().messages.filter(({ status }) => status === 'queued')).toHaveLength(3);

    await restartedEngine.setOnline(true);
    const synchronized = restartedEngine.getSnapshot().messages;
    expect(synchronized.filter(({ direction }) => direction === 'incoming')).toHaveLength(4);
    expect(synchronized.filter(({ direction }) => direction === 'outgoing')).toHaveLength(3);
    expect(new Set(synchronized.map(({ key }) => key)).size).toBe(7);

    const secondRestart = new ChatEngine(storage, new MockChatService(storage));
    await secondRestart.initialize();
    const finalMessages = secondRestart.getSnapshot().messages;
    expect(finalMessages.filter(({ text }) => text.startsWith('offline '))).toHaveLength(3);
    expect(new Set(finalMessages.map(({ key }) => key)).size).toBe(finalMessages.length);
  });
});
