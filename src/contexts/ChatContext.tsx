import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  ChatEngine,
  MockChatService,
  type MediaAttachment,
  type SendFailureMode,
} from '@/features/chat';

type ChatContextValue = {
  engine: ChatEngine;
  send: (text: string, media?: MediaAttachment) => Promise<void>;
  retry: (clientId: string) => Promise<void>;
  setOnline: (online: boolean) => Promise<void>;
  reconnect: () => Promise<void>;
  loadOlder: () => Promise<void>;
  simulateIncoming: (count: number) => Promise<void>;
  seedHistory: (count: number) => Promise<void>;
  setNextFailure: (mode: SendFailureMode) => void;
  resetChat: () => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);
const ChatSnapshotContext = createContext<ReturnType<ChatEngine['getSnapshot']> | undefined>(
  undefined,
);
const conversationEngines = new Map<string, ChatEngine>();
const initializedEngines = new WeakSet<ChatEngine>();

function getConversationEngine(threadId: string) {
  const existing = conversationEngines.get(threadId);
  if (existing) return existing;
  const engine = new ChatEngine(AsyncStorage, new MockChatService(AsyncStorage, threadId));
  conversationEngines.set(threadId, engine);
  return engine;
}

function useEngineState(threadId: string) {
  const engine = useMemo(() => getConversationEngine(threadId), [threadId]);
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);

  useEffect(() => {
    if (initializedEngines.has(engine)) return;
    initializedEngines.add(engine);
    void engine.initialize();
  }, [engine]);

  const actions = useMemo<ChatContextValue>(
    () => ({
      engine,
      loadOlder: () => engine.loadOlder(),
      reconnect: () => engine.reconnect(),
      resetChat: () => engine.reset(),
      retry: (clientId) => engine.retry(clientId),
      seedHistory: (count) => engine.seedHistory(count),
      send: (text, media) => engine.send(text, media),
      setNextFailure: (mode) => engine.setNextFailure(mode),
      setOnline: (online) => engine.setOnline(online),
      simulateIncoming: (count) => engine.simulateIncoming(count),
    }),
    [engine],
  );

  return { ...actions, ...snapshot };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const state = useEngineState('default');
  const { engine, ...snapshot } = state;
  const value = state;

  return (
    <ChatContext.Provider value={value}>
      <ChatSnapshotContext.Provider value={snapshot}>{children}</ChatSnapshotContext.Provider>
    </ChatContext.Provider>
  );
}

export function useConversationChat(threadId: string) {
  return useEngineState(threadId);
}

export function useChat() {
  const actions = useContext(ChatContext);
  const snapshot = useContext(ChatSnapshotContext);
  if (!actions || !snapshot) throw new Error('useChat must be used within ChatProvider');
  return { ...actions, ...snapshot };
}
