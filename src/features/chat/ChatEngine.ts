import type { KeyValueStorage } from '@/features/purchases';

import { ChatServiceError, MockChatService } from './MockChatService';
import type {
  ChatSnapshot,
  MediaAttachment,
  SendFailureMode,
  ServerMessage,
  ThreadMessage,
} from './types';

const queueKey = (threadId: string) => `chat-client:pending:${threadId}`;
const cacheKey = (threadId: string) => `chat-client:cache:${threadId}`;
const metaKey = (threadId: string) => `chat-client:meta:${threadId}`;
const connectivityKey = (threadId: string) => `chat-client:online:${threadId}`;

type ClientMeta = {
  installId: string;
  localSequence: number;
  syncCursor: number;
};

const initialSnapshot: ChatSnapshot = {
  messages: [],
  isHydrated: false,
  isOnline: true,
  isSyncing: false,
  hasOlderMessages: true,
  sendFailureMode: 'none',
};

const createInstallId = () =>
  `install-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function toThreadMessage(message: ServerMessage): ThreadMessage {
  return {
    ...message,
    key: message.clientId ?? message.serverId,
    status: 'sent',
  };
}

function mergeMessages(current: ThreadMessage[], incoming: ThreadMessage[]) {
  const byKey = new Map(current.map((message) => [message.key, message]));
  for (const message of incoming) {
    const existing = byKey.get(message.key);
    byKey.set(message.key, existing ? { ...existing, ...message } : message);
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.serverSequence != null && b.serverSequence != null) {
      return b.serverSequence - a.serverSequence;
    }
    if (a.serverSequence != null) return 1;
    if (b.serverSequence != null) return -1;
    return (b.localSequence ?? 0) - (a.localSequence ?? 0);
  });
}

export class ChatEngine {
  private snapshot = initialSnapshot;
  private listeners = new Set<() => void>();
  private queue: ThreadMessage[] = [];
  private meta: ClientMeta = { installId: createInstallId(), localSequence: 0, syncCursor: 0 };
  private draining = false;

  constructor(
    private readonly storage: KeyValueStorage,
    readonly service: MockChatService,
  ) {}

  private get threadId() {
    return this.service.threadId;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  private update(patch: Partial<ChatSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private async persistClient() {
    await Promise.all([
      this.storage.setItem(queueKey(this.threadId), JSON.stringify(this.queue)),
      this.storage.setItem(
        cacheKey(this.threadId),
        JSON.stringify(this.snapshot.messages.filter(({ status }) => status === 'sent').slice(0, 500)),
      ),
      this.storage.setItem(metaKey(this.threadId), JSON.stringify(this.meta)),
    ]);
  }

  async initialize() {
    const [queueValue, cacheValue, metaValue, connectivityValue] = await Promise.all([
      this.storage.getItem(queueKey(this.threadId)),
      this.storage.getItem(cacheKey(this.threadId)),
      this.storage.getItem(metaKey(this.threadId)),
      this.storage.getItem(connectivityKey(this.threadId)),
    ]);
    this.queue = queueValue ? (JSON.parse(queueValue) as ThreadMessage[]) : [];
    const cached = cacheValue ? (JSON.parse(cacheValue) as ThreadMessage[]) : [];
    this.meta = metaValue ? (JSON.parse(metaValue) as ClientMeta) : this.meta;
    const isOnline = connectivityValue !== 'false';
    this.service.setOnline(isOnline);
    this.update({ messages: mergeMessages(cached, this.queue), isHydrated: true, isOnline });

    if (this.snapshot.isOnline) {
      await this.reconnect();
      if (!this.snapshot.messages.some(({ serverSequence }) => serverSequence != null)) {
        await this.loadOlder();
      }
    }
  }

  async send(text: string, media?: MediaAttachment) {
    this.meta.localSequence += 1;
    const clientId = `${this.meta.installId}:${this.meta.localSequence}`;
    const message: ThreadMessage = {
      key: clientId,
      clientId,
      localSequence: this.meta.localSequence,
      direction: 'outgoing',
      kind: media ? 'media' : 'text',
      text,
      createdAt: Date.now(),
      status: 'queued',
      media,
    };

    this.queue.push(message);
    await this.storage.setItem(queueKey(this.threadId), JSON.stringify(this.queue));
    await this.storage.setItem(metaKey(this.threadId), JSON.stringify(this.meta));
    this.update({ messages: mergeMessages(this.snapshot.messages, [message]) });

    if (this.snapshot.isOnline) await this.drainQueue();
  }

  async retry(clientId: string) {
    this.queue = this.queue.map((message) =>
      message.clientId === clientId ? { ...message, status: 'queued', error: undefined } : message,
    );
    await this.storage.setItem(queueKey(this.threadId), JSON.stringify(this.queue));
    this.update({ messages: mergeMessages(this.snapshot.messages, this.queue) });
    if (this.snapshot.isOnline) await this.drainQueue();
  }

  private async drainQueue() {
    if (this.draining || !this.snapshot.isOnline) return;
    this.draining = true;

    try {
      for (const queued of [...this.queue].sort(
        (a, b) => (a.localSequence ?? 0) - (b.localSequence ?? 0),
      )) {
        const sending = { ...queued, status: 'sending' as const, error: undefined };
        this.queue = this.queue.map((message) =>
          message.clientId === queued.clientId ? sending : message,
        );
        this.update({ messages: mergeMessages(this.snapshot.messages, [sending]) });
        await this.storage.setItem(queueKey(this.threadId), JSON.stringify(this.queue));

        try {
          const confirmed = await this.service.send({
            clientId: queued.clientId!,
            text: queued.text,
            createdAt: queued.createdAt,
            media: queued.media,
          });
          const confirmedMessage = toThreadMessage(confirmed);
          this.queue = this.queue.filter(({ clientId }) => clientId !== queued.clientId);
          this.meta.syncCursor = Math.max(this.meta.syncCursor, confirmed.serverSequence);
          this.update({ messages: mergeMessages(this.snapshot.messages, [confirmedMessage]) });
          await this.persistClient();
        } catch (error) {
          const serviceError =
            error instanceof ChatServiceError
              ? error
              : new ChatServiceError('Unexpected send failure.', 'unexpected', true);
          const failed: ThreadMessage = {
            ...queued,
            status: serviceError.code === 'offline' ? 'queued' : 'failed',
            error: {
              code: serviceError.code,
              message: serviceError.message,
              recoverable: serviceError.recoverable,
            },
          };
          this.queue = this.queue.map((message) =>
            message.clientId === queued.clientId ? failed : message,
          );
          this.update({ messages: mergeMessages(this.snapshot.messages, [failed]) });
          await this.storage.setItem(queueKey(this.threadId), JSON.stringify(this.queue));
          break;
        }
      }
    } finally {
      this.draining = false;
    }
  }

  async setOnline(online: boolean) {
    await this.storage.setItem(connectivityKey(this.threadId), String(online));
    this.service.setOnline(online);
    this.update({ isOnline: online });
    if (online) await this.reconnect();
  }

  async reconnect() {
    if (!this.snapshot.isOnline || this.snapshot.isSyncing) return;
    this.update({ isSyncing: true });
    try {
      const incoming = await this.service.getAfter(this.meta.syncCursor);
      if (incoming.length) {
        this.meta.syncCursor = Math.max(...incoming.map(({ serverSequence }) => serverSequence));
        this.update({ messages: mergeMessages(this.snapshot.messages, incoming.map(toThreadMessage)) });
      }
      await this.drainQueue();
      await this.persistClient();
    } finally {
      this.update({ isSyncing: false });
    }
  }

  async loadOlder() {
    if (!this.snapshot.isOnline || this.snapshot.isSyncing || !this.snapshot.hasOlderMessages) return;
    this.update({ isSyncing: true });
    try {
      const oldestSequence = this.snapshot.messages.reduce(
        (oldest, message) =>
          message.serverSequence != null ? Math.min(oldest, message.serverSequence) : oldest,
        Number.POSITIVE_INFINITY,
      );
      const page = await this.service.getPage({
        beforeSequence: Number.isFinite(oldestSequence) ? oldestSequence : undefined,
        limit: 50,
      });
      this.update({
        messages: mergeMessages(this.snapshot.messages, page.messages.map(toThreadMessage)),
        hasOlderMessages: page.hasMore,
      });
      await this.persistClient();
    } finally {
      this.update({ isSyncing: false });
    }
  }

  setNextFailure(mode: SendFailureMode) {
    this.service.setNextFailure(mode);
    this.update({ sendFailureMode: mode });
  }

  async simulateIncoming(count: number) {
    await this.service.simulateIncoming(count);
    if (this.snapshot.isOnline) await this.reconnect();
  }

  async seedHistory(count: number) {
    await this.service.seedHistory(count);
    this.update({ messages: this.queue, hasOlderMessages: true });
    await this.loadOlder();
  }

  async reset() {
    const isOnline = this.snapshot.isOnline;
    await Promise.all([
      this.storage.removeItem(queueKey(this.threadId)),
      this.storage.removeItem(cacheKey(this.threadId)),
      this.storage.removeItem(metaKey(this.threadId)),
      this.service.reset(),
    ]);
    this.queue = [];
    this.meta = { installId: createInstallId(), localSequence: 0, syncCursor: 0 };
    this.service.setOnline(isOnline);
    this.snapshot = { ...initialSnapshot, isHydrated: true, isOnline };
    this.listeners.forEach((listener) => listener());
  }
}
