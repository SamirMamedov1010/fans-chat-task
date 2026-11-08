import type { KeyValueStorage } from '@/features/purchases';

const BULK_MESSAGES_KEY = 'mock-backend:bulk-messages';
const listeners = new Set<() => void>();

export function subscribeToBulkMessages(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export type BulkMessageRecord = {
  id: string;
  batchId: string;
  recipientId: string;
  text: string;
  createdAt: number;
};

export class MockBulkMessageService {
  constructor(private readonly storage: KeyValueStorage) {}

  private async read(): Promise<BulkMessageRecord[]> {
    const value = await this.storage.getItem(BULK_MESSAGES_KEY);
    return value ? (JSON.parse(value) as BulkMessageRecord[]) : [];
  }

  async sendSeparately(recipientIds: string[], text: string) {
    const recipients = [...new Set(recipientIds)];
    const createdAt = Date.now();
    const batchId = `bulk-${createdAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const records = recipients.map<BulkMessageRecord>((recipientId, index) => ({
      id: `${batchId}:${recipientId}`,
      batchId,
      recipientId,
      text,
      createdAt: createdAt + index,
    }));
    const existing = await this.read();
    await this.storage.setItem(BULK_MESSAGES_KEY, JSON.stringify([...existing, ...records]));
    notifyListeners();
    return records;
  }

  async removeMessagesForRecipient(recipientId: string) {
    const existing = await this.read();
    const remaining = existing.filter((message) => message.recipientId !== recipientId);
    await this.storage.setItem(BULK_MESSAGES_KEY, JSON.stringify(remaining));
    notifyListeners();
  }

  async getMessagesForRecipients(recipientIds: string[]) {
    const recipientSet = new Set(recipientIds);
    return (await this.read()).filter(({ recipientId }) => recipientSet.has(recipientId));
  }

  async getLatestMessageByRecipient() {
    const latest: Record<string, BulkMessageRecord> = {};
    for (const message of await this.read()) {
      const current = latest[message.recipientId];
      if (!current || message.createdAt > current.createdAt) {
        latest[message.recipientId] = message;
      }
    }
    return latest;
  }
}
