import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatListItem, ChatsInputSection, CustomHeader, IconButton } from '@/components';
import { BackIcon, PlusIcon } from '@/components/icons';
import { useBottomSheet } from '@/contexts';
import { MockChatService, type ServerMessage } from '@/features/chat';
import {
  MOCK_USERS,
  MockBulkMessageService,
  resolveSelectedUsers,
  type BulkMessageRecord,
  type MockUser,
} from '@/features/contacts';
import { colors } from '@/theme';

import { CHATS_HEADER_HEIGHT, useAnimatedOnScroll } from './hooks/useAnimatedOnScroll';

const avatar = require('@/assets/images/avatar.png');

type ChatsListItem =
  | { id: 'input-section'; type: 'input-section' }
  | { id: string; type: 'chat'; user: MockUser };

function formatRelativeTime(createdAt: number, now: number) {
  const elapsedMinutes = Math.max(0, Math.floor((now - createdAt) / 60_000));
  if (elapsedMinutes < 1) return 'Now';
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}d ago`;
  return new Date(createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function ChatsScreen() {
  const [search, setSearch] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [bulkPreviews, setBulkPreviews] = useState<Record<string, BulkMessageRecord>>({});
  const [threadPreviews, setThreadPreviews] = useState<Record<string, ServerMessage>>({});
  const [previewLoadedAt, setPreviewLoadedAt] = useState(0);
  const bulkMessageService = useMemo(() => new MockBulkMessageService(AsyncStorage), []);
  const { open } = useBottomSheet();
  const { scrollHandler, scrollY } = useAnimatedOnScroll();
  const normalizedSearch = search.trim().toLowerCase();
  const getLatestTimestamp = (userId: string) =>
    Math.max(bulkPreviews[userId]?.createdAt ?? 0, threadPreviews[userId]?.createdAt ?? 0);
  const visibleUsers = MOCK_USERS.filter(
    ({ name, subtitle }) =>
      !normalizedSearch ||
      name.toLowerCase().includes(normalizedSearch) ||
      subtitle.toLowerCase().includes(normalizedSearch),
  ).sort((a, b) => {
    const aCreatedAt = getLatestTimestamp(a.id);
    const bCreatedAt = getLatestTimestamp(b.id);
    if (aCreatedAt !== bCreatedAt) return bCreatedAt - aCreatedAt;
    return MOCK_USERS.findIndex(({ id }) => id === a.id) - MOCK_USERS.findIndex(({ id }) => id === b.id);
  });
  const chats: ChatsListItem[] = [
    { id: 'input-section', type: 'input-section' },
    ...visibleUsers.map((user) => ({ id: user.id, type: 'chat' as const, user })),
  ];

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([
        bulkMessageService.getLatestMessageByRecipient(),
        Promise.all(
          MOCK_USERS.map(async (user) => {
            const page = await new MockChatService(AsyncStorage, user.id).getPage({ limit: 1 });
            return [user.id, page.messages[0]] as const;
          }),
        ),
      ]).then(([latestBulk, latestThreads]) => {
        if (active) {
          setBulkPreviews(latestBulk);
          setThreadPreviews(
            Object.fromEntries(latestThreads.filter((entry): entry is readonly [string, ServerMessage] => Boolean(entry[1]))),
          );
          setPreviewLoadedAt(Date.now());
        }
      });
      return () => {
        active = false;
      };
    }, [bulkMessageService]),
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, CHATS_HEADER_HEIGHT * 0.8],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  const handleChatPress = (chatId: string) => {
    setSelectedChatId(chatId);
    router.push(
      {
        pathname: '/chats/[chatId]',
        params: { backTo: '/chats', chatId },
      },
      { withAnchor: false },
    );
  };

  const handleCreateChatPress = () => {
    open({
      type: 'newMessage',
      snapPoints: ['85%'],
      data: {
        onStartChat: (selectedIds) => {
          const recipients = resolveSelectedUsers(selectedIds);
          if (recipients.length === 1) {
            handleChatPress(recipients[0].id);
            return;
          }
          if (recipients.length > 1) {
            router.push({
              pathname: '/chats/bulk',
              params: { recipientIds: selectedIds.join(',') },
            });
          }
        },
      },
    });
  };

  const renderItem: ListRenderItem<ChatsListItem> = ({ item }) => {
    if (item.type === 'input-section') {
      return <ChatsInputSection onChangeText={setSearch} value={search} />;
    }

    const userIndex = MOCK_USERS.findIndex(({ id }) => id === item.user.id);
    const latestBulkMessage = bulkPreviews[item.user.id];
    const latestThreadMessage = threadPreviews[item.user.id];
    const latestMessage =
      latestBulkMessage && (!latestThreadMessage || latestBulkMessage.createdAt > latestThreadMessage.createdAt)
        ? latestBulkMessage
        : latestThreadMessage;
    const message = !latestMessage
      ? 'No messages yet'
      : 'recipientId' in latestMessage
        ? `You: ${latestMessage.text}`
        : latestMessage.kind === 'media'
          ? `You: ${latestMessage.media?.type === 'video' ? 'Video' : 'Photo'}`
          : latestMessage.direction === 'outgoing' && !latestMessage.text.startsWith('You:')
            ? `You: ${latestMessage.text}`
            : latestMessage.text;

    return (
      <View style={styles.listItem}>
        <ChatListItem
          activityAvatarSource={avatar}
          avatarSource={avatar}
          displayName={item.user.name}
          message={message}
          onPress={() => handleChatPress(item.id)}
          selected={selectedChatId === item.id}
          status={userIndex % 3 === 0 ? 'online' : 'offline'}
          time={
            latestMessage ? formatRelativeTime(latestMessage.createdAt, previewLoadedAt) : ''
          }
          username={item.user.subtitle}
        />
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <Animated.FlatList
        data={chats}
        extraData={{ bulkPreviews, previewLoadedAt, search, selectedChatId, threadPreviews }}
        initialNumToRender={12}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Animated.View style={headerAnimatedStyle}>
            <CustomHeader
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
                  accessibilityLabel="Create chat"
                  icon={PlusIcon}
                  onPress={handleCreateChatPress}
                />
              }
              title="Chats"
            />
          </Animated.View>
        }
        onScroll={scrollHandler}
        renderItem={renderItem}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listItem: {
    paddingHorizontal: 8,
  },
});
