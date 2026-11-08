import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

import { BottomSheetWrapper, type BottomSheetWrapperRef } from '@/components/BottomSheetWrapper';
import { FanDetailsModal } from '@/components/modals/FanDetailsModal';
import { ChatDebugModal } from '@/components/modals/ChatDebugModal';
import { GiftStoreModal } from '@/components/modals/GiftStoreModal';
import { MessageActionsModal } from '@/components/modals/MessageActionsModal';
import { NewMessageModal } from '@/components/modals/NewMessageModal';
import { PaywallModal } from '@/components/modals/PaywallModal';

export type BottomSheetType =
  | 'chatDebug'
  | 'fanDetails'
  | 'giftStore'
  | 'messageActions'
  | 'newMessage'
  | 'paywall'
  | null;

type BottomSheetData = {
  chatId?: string;
  onPickMedia?: () => Promise<void>;
  onStartChat?: (selectedIds: string[]) => void;
};

export type OpenBottomSheetParams = {
  type: Exclude<BottomSheetType, null>;
  data?: BottomSheetData;
  snapPoints?: (number | string)[];
};

type BottomSheetContextValue = {
  open: (params: OpenBottomSheetParams) => void;
  close: () => void;
};

const BottomSheetContext = createContext<BottomSheetContextValue | undefined>(undefined);

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error('useBottomSheet must be used within BottomSheetProvider');
  }

  return context;
}

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const bottomSheetRef = useRef<BottomSheetWrapperRef>(null);
  const activeModalRef = useRef<BottomSheetType>(null);
  const pendingOpenRef = useRef<OpenBottomSheetParams | null>(null);
  const [activeModal, setActiveModal] = useState<BottomSheetType>(null);
  const [modalData, setModalData] = useState<BottomSheetData>();
  const [snapPoints, setSnapPoints] = useState<(number | string)[]>(['94%']);

  const present = useCallback(({ data, snapPoints: nextSnapPoints, type }: OpenBottomSheetParams) => {
    activeModalRef.current = type;
    setActiveModal(type);
    setModalData(data);
    setSnapPoints(nextSnapPoints ?? ['94%']);

    requestAnimationFrame(() => bottomSheetRef.current?.open());
  }, []);

  const open = useCallback(
    (params: OpenBottomSheetParams) => {
      if (activeModalRef.current) {
        pendingOpenRef.current = params;
        bottomSheetRef.current?.close();
        return;
      }

      present(params);
    },
    [present],
  );

  const close = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleDismiss = useCallback(() => {
    activeModalRef.current = null;
    setActiveModal(null);
    setModalData(undefined);
    setSnapPoints(['94%']);

    const pendingOpen = pendingOpenRef.current;
    if (!pendingOpen) return;

    pendingOpenRef.current = null;
    requestAnimationFrame(() => present(pendingOpen));
  }, [present]);

  return (
    <BottomSheetContext.Provider value={{ close, open }}>
      {children}

      <BottomSheetWrapper ref={bottomSheetRef} onDismiss={handleDismiss} snapPoints={snapPoints}>
        {activeModal === 'fanDetails' ? <FanDetailsModal close={close} /> : null}
        {activeModal === 'newMessage' ? (
          <NewMessageModal close={close} onStartChat={modalData?.onStartChat} />
        ) : null}
        {activeModal === 'paywall' ? <PaywallModal close={close} /> : null}
        {activeModal === 'giftStore' ? <GiftStoreModal close={close} /> : null}
        {activeModal === 'messageActions' ? (
          <MessageActionsModal
            close={close}
            onGiftPress={() => open({ type: 'giftStore', snapPoints: ['52%'] })}
            onPickMedia={modalData?.onPickMedia}
          />
        ) : null}
        {activeModal === 'chatDebug' ? (
          <ChatDebugModal chatId={modalData?.chatId ?? 'default'} close={close} />
        ) : null}
      </BottomSheetWrapper>
    </BottomSheetContext.Provider>
  );
}
