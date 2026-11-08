import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PurchaseFeedback } from '@/components';
import { BottomSheetProvider, ChatProvider, PurchaseProvider, ToastProvider } from '@/contexts';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <PurchaseProvider>
            <ChatProvider>
              <ToastProvider>
                <BottomSheetModalProvider>
                  <PurchaseFeedback />
                  <BottomSheetProvider>
                    <StatusBar style="dark" />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="chats/bulk" />
                      <Stack.Screen name="chats/[chatId]" />
                    </Stack>
                  </BottomSheetProvider>
                </BottomSheetModalProvider>
              </ToastProvider>
            </ChatProvider>
          </PurchaseProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
