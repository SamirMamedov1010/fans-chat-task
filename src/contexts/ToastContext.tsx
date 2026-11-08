import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

type ToastKind = 'error' | 'info' | 'success';
type ToastOptions = {
  actionLabel?: string;
  duration?: number;
  kind?: ToastKind;
  onAction?: () => void;
};
type ToastState = ToastOptions & { id: number; message: string };

const ToastContext = createContext<
  { hideToast: () => void; showToast: (message: string, options?: ToastOptions) => void } | undefined
>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-12));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reducedMotion = useRef(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reducedMotion.current = enabled;
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reducedMotion.current = enabled;
    });
    return () => subscription.remove();
  }, []);

  const hideToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (reducedMotion.current) {
      setToast(undefined);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { duration: 140, toValue: 0, useNativeDriver: true }),
      Animated.timing(translateY, { duration: 140, toValue: -8, useNativeDriver: true }),
    ]).start(() => setToast(undefined));
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ ...options, id: Date.now(), message });
      AccessibilityInfo.announceForAccessibility(message);
      opacity.setValue(reducedMotion.current ? 1 : 0);
      translateY.setValue(reducedMotion.current ? 0 : -12);
      if (!reducedMotion.current) {
        Animated.parallel([
          Animated.timing(opacity, { duration: 180, toValue: 1, useNativeDriver: true }),
          Animated.timing(translateY, { duration: 180, toValue: 0, useNativeDriver: true }),
        ]).start();
      }
      timer.current = setTimeout(hideToast, options.duration ?? 3500);
    },
    [hideToast, opacity, translateY],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ hideToast, showToast }}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.layer, { top: insets.top + 8 }]}>
          <Animated.View
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              styles[toast.kind ?? 'info'],
              { opacity, transform: [{ translateY }] },
            ]}>
            <Text style={styles.message}>{toast.message}</Text>
            {toast.actionLabel && toast.onAction ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  hideToast();
                  toast.onAction?.();
                }}>
                <Text style={styles.action}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 16, right: 16, zIndex: 1000, elevation: 20 },
  toast: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.14)',
  },
  info: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  success: { backgroundColor: '#14532D', borderColor: colors.success },
  error: { backgroundColor: '#7F1D1D', borderColor: colors.destructive },
  message: {
    flex: 1,
    color: colors.background,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm,
  },
  action: {
    color: '#C7D2FE',
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});
