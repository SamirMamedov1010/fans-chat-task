export type MessageDeliveryStatus = 'queued' | 'sending' | 'sent' | 'failed';
export type MessageKind = 'gift' | 'media' | 'text';

export type MediaAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  type: 'image' | 'video';
};

export type ThreadMessage = {
  key: string;
  clientId?: string;
  serverId?: string;
  serverSequence?: number;
  localSequence?: number;
  direction: 'incoming' | 'outgoing';
  kind: MessageKind;
  text: string;
  createdAt: number;
  status: MessageDeliveryStatus;
  media?: MediaAttachment;
  giftAmount?: number;
  purchaseEventId?: string;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
};

export type ServerMessage = Omit<ThreadMessage, 'key' | 'status'> & {
  serverId: string;
  serverSequence: number;
};

export type SendMessageInput = {
  clientId: string;
  text: string;
  createdAt: number;
  media?: MediaAttachment;
};

export type SendFailureMode = 'none' | 'response-lost' | 'temporary';

export type ChatSnapshot = {
  messages: ThreadMessage[];
  isHydrated: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  hasOlderMessages: boolean;
  sendFailureMode: SendFailureMode;
};
