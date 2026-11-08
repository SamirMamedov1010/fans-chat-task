import { MockPurchaseBackend, type KeyValueStorage } from '@/features/purchases';

import type { SendFailureMode, SendMessageInput, ServerMessage } from './types';

const serverKey = (threadId: string) => `mock-backend:chat:${threadId}`;

type ServerState = {
  acceptedClientIds: Record<string, string>;
  messages: ServerMessage[];
  nextSequence: number;
  seedCount: number;
};

const createInitialState = (): ServerState => ({
  acceptedClientIds: {},
  messages: [],
  nextSequence: 5,
  seedCount: 4,
});

const createEmptyState = (): ServerState => ({
  acceptedClientIds: {},
  messages: [],
  nextSequence: 1,
  seedCount: 0,
});

export class ChatServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly recoverable: boolean,
  ) {
    super(message);
  }
}

function seededMessage(sequence: number, threadId: string): ServerMessage {
  const incoming = sequence % 3 === 0;
  const threadLabel = threadId === 'default' ? 'fan' : threadId.replace('user-', 'fan ');
  const textTemplates = [
    `Hey from ${threadLabel}!`,
    `Thanks, I received your message for ${threadLabel}.`,
    `Let’s catch up soon, ${threadLabel}.`,
    `You: Great, talk to ${threadLabel} later!`,
  ];
  return {
    serverId: `seed-${sequence}`,
    serverSequence: sequence,
    direction: incoming ? 'incoming' : 'outgoing',
    kind: 'text',
    text: textTemplates[(sequence - 1) % textTemplates.length],
    createdAt: 1_700_000_000_000 + sequence * 1_000,
  };
}

export class MockChatService {
  private online = true;
  private nextFailure: SendFailureMode = 'none';
  private readonly purchaseBackend: MockPurchaseBackend;

  constructor(
    private readonly storage: KeyValueStorage,
    readonly threadId = 'default',
  ) {
    this.purchaseBackend = new MockPurchaseBackend(storage);
  }

  setOnline(online: boolean) {
    this.online = online;
  }

  setNextFailure(mode: SendFailureMode) {
    this.nextFailure = mode;
  }

  private ensureOnline() {
    if (!this.online) throw new ChatServiceError('Waiting for connection.', 'offline', true);
  }

  private async read(): Promise<ServerState> {
    const value = await this.storage.getItem(serverKey(this.threadId));
    return value ? (JSON.parse(value) as ServerState) : createInitialState();
  }

  private async write(state: ServerState) {
    await this.storage.setItem(serverKey(this.threadId), JSON.stringify(state));
  }

  async send(input: SendMessageInput): Promise<ServerMessage> {
    this.ensureOnline();

    // Once accepted, the same stable client ID always resolves to the same server message.
    const state = await this.read();
    const acceptedServerId = state.acceptedClientIds[input.clientId];
    if (acceptedServerId) {
      const existing = state.messages.find(({ serverId }) => serverId === acceptedServerId);
      if (existing) return existing;
    }

    const entitlement = (await this.purchaseBackend.getSnapshot()).entitlement;
    if (!entitlement) {
      throw new ChatServiceError(
        'Paid access must be confirmed before sending.',
        'paid-access-required',
        false,
      );
    }

    if (this.nextFailure === 'temporary') {
      this.nextFailure = 'none';
      throw new ChatServiceError('Temporary server failure. Try again.', 'temporary', true);
    }

    const message: ServerMessage = {
      serverId: `server-${state.nextSequence}`,
      serverSequence: state.nextSequence,
      clientId: input.clientId,
      direction: 'outgoing',
      kind: input.media ? 'media' : 'text',
      text: input.text,
      createdAt: input.createdAt,
      media: input.media,
    };
    state.nextSequence += 1;
    state.acceptedClientIds[input.clientId] = message.serverId;
    state.messages.push(message);
    await this.write(state);

    if (this.nextFailure === 'response-lost') {
      this.nextFailure = 'none';
      throw new ChatServiceError(
        'The server accepted the message, but its response was lost.',
        'response-lost',
        true,
      );
    }

    return message;
  }

  async getPage(options: { beforeSequence?: number; limit: number }) {
    this.ensureOnline();
    const state = await this.read();
    const maximumSequence = state.nextSequence - 1;
    const beforeSequence = options.beforeSequence ?? maximumSequence + 1;
    const dynamicBySequence = new Map(
      state.messages.map((message) => [message.serverSequence, message]),
    );
    const messages: ServerMessage[] = [];

    for (let sequence = beforeSequence - 1; sequence >= 1 && messages.length < options.limit; sequence -= 1) {
      const dynamic = dynamicBySequence.get(sequence);
      if (dynamic) messages.push(dynamic);
      else if (sequence <= state.seedCount) messages.push(seededMessage(sequence, this.threadId));
    }

    return {
      messages,
      hasMore: messages.length > 0 && (messages.at(-1)?.serverSequence ?? 1) > 1,
    };
  }

  async getAfter(sequence: number) {
    this.ensureOnline();
    const state = await this.read();
    return state.messages
      .filter((message) => message.serverSequence > sequence)
      .sort((a, b) => a.serverSequence - b.serverSequence);
  }

  async simulateIncoming(count: number) {
    const state = await this.read();
    for (let index = 0; index < count; index += 1) {
      state.messages.push({
        serverId: `server-${state.nextSequence}`,
        serverSequence: state.nextSequence,
        direction: 'incoming',
        kind: 'text',
        text: `Incoming while offline ${index + 1}`,
        createdAt: Date.now() + index,
      });
      state.nextSequence += 1;
    }
    await this.write(state);
  }

  async seedHistory(count: number) {
    const state = await this.read();
    state.seedCount = count;
    state.nextSequence = Math.max(state.nextSequence, count + 1);
    await this.write(state);
  }

  async reset() {
    // Persist an explicit empty server state. Removing the key would make the
    // next app launch treat this as a brand-new conversation and recreate the
    // four demo seed messages.
    await this.write(createEmptyState());
  }
}
