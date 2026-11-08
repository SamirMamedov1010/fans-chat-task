import { useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatHeader, ChatMessages, CustomHeader, IconButton } from '@/components';
import { BackIcon, MoreVerticalIcon } from '@/components/icons';
import { useBottomSheet, useConversationChat, useToast } from '@/contexts';
import { MOCK_USERS } from '@/features/contacts';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const avatar = require('@/assets/images/avatar.png');

export function ChatScreen() {
  const { backTo, chatId, profileHistory } = useLocalSearchParams<{
    backTo?: string | string[];
    chatId?: string | string[];
    profileHistory?: string | string[];
  }>();
  const { open } = useBottomSheet();
  const { showToast } = useToast();
  const didSeedProfile = useRef(false);
  const resolvedChatId = Array.isArray(chatId) ? chatId[0] : chatId;
  const activeUser = MOCK_USERS.find(({ id }) => id === resolvedChatId) ?? MOCK_USERS[0];
  const { seedHistory } = useConversationChat(activeUser.id);

  useEffect(() => {
    const requestedCount = Number(Array.isArray(profileHistory) ? profileHistory[0] : profileHistory);
    if (requestedCount !== 50_000 || didSeedProfile.current) return;
    didSeedProfile.current = true;
    void seedHistory(requestedCount).then(() => {
      showToast('Repeatable 50,000-message history is ready.', { kind: 'success' });
    });
  }, [profileHistory, seedHistory, showToast]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    const backToPath = Array.isArray(backTo) ? backTo[0] : backTo;
    if (backToPath === '/chats') {
      router.replace(backToPath);
      return;
    }

    router.replace('/chats');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <CustomHeader
        contentStyle={styles.navigationContent}
        leftButton={
          <IconButton
            accessibilityLabel="Go back"
            backgroundColor="transparent"
            icon={BackIcon}
            onPress={handleBackPress}
            withInsetShadow={false}
          />
        }
        rightButton={
          <IconButton
            accessibilityLabel="Open chat actions"
            backgroundColor="transparent"
            icon={MoreVerticalIcon}
            onPress={() =>
              open({
                type: 'chatDebug',
                snapPoints: ['68%'],
                data: { chatId: activeUser.id },
              })
            }
            withInsetShadow={false}
          />
        }
        title="Chat with"
        titleStyle={styles.navigationTitle}
        withBorder={false}
      />

      <ChatHeader
        avatarSource={avatar}
        displayName={activeUser.name}
        onDetailsPress={() => open({ type: 'fanDetails', snapPoints: ['85%'] })}
        username={activeUser.subtitle}
      />

      <ChatMessages recipientId={activeUser.id} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navigationContent: {
    minHeight: 44,
    paddingVertical: 4,
  },
  navigationTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
});
