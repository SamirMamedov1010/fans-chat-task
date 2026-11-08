import { MemoryStorage } from '@/test/MemoryStorage';

import { MockBulkMessageService } from './MockBulkMessageService';
import { resolveSelectedUsers } from './mockContacts';

describe('separate messages', () => {
  test('expands FanSuites and removes duplicate users', () => {
    const users = resolveSelectedUsers(['suite-vip', 'user-2', 'user-4']);
    expect(users.map(({ id }) => id)).toEqual(['user-1', 'user-2', 'user-3', 'user-4']);
  });

  test('persists one independent message per recipient', async () => {
    const service = new MockBulkMessageService(new MemoryStorage());
    const records = await service.sendSeparately(
      ['user-1', 'user-2', 'user-2', 'user-3'],
      'Separate hello',
    );

    expect(records).toHaveLength(3);
    expect(new Set(records.map(({ recipientId }) => recipientId)).size).toBe(3);
    expect(new Set(records.map(({ batchId }) => batchId)).size).toBe(1);
    await expect(service.getMessagesForRecipients(['user-2'])).resolves.toHaveLength(1);
    const latest = await service.getLatestMessageByRecipient();
    expect(latest['user-1']?.text).toBe('Separate hello');
    expect(latest['user-2']?.text).toBe('Separate hello');
    expect(latest['user-3']?.text).toBe('Separate hello');
  });

  test('removes only the selected recipient conversation', async () => {
    const service = new MockBulkMessageService(new MemoryStorage());
    await service.sendSeparately(['user-1', 'user-2'], 'Separate hello');

    await service.removeMessagesForRecipient('user-1');

    await expect(service.getMessagesForRecipients(['user-1'])).resolves.toEqual([]);
    await expect(service.getMessagesForRecipients(['user-2'])).resolves.toHaveLength(1);
  });
});
