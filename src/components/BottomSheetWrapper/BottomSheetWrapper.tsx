import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export type BottomSheetWrapperRef = {
  open: () => void;
  close: () => void;
};

export type BottomSheetWrapperProps = Omit<
  BottomSheetModalProps,
  'children' | 'ref' | 'snapPoints'
> & {
  children: React.ReactNode;
  snapPoints?: (number | string)[];
};

export const BottomSheetWrapper = forwardRef<BottomSheetWrapperRef, BottomSheetWrapperProps>(
  function BottomSheetWrapper(
    { children, onDismiss, snapPoints = ['94%'], ...bottomSheetProps },
    ref,
  ) {
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.18}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        enableOverDrag={false}
        handleComponent={null}
        index={0}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        onDismiss={onDismiss}
        snapPoints={snapPoints}
        {...bottomSheetProps}>
        <BottomSheetView style={styles.content}>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    backgroundColor: colors.background,
  },
  content: {
    height: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    backgroundColor: colors.background,
  },
});
