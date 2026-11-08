import { router, Tabs } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarTabIcon,
  ChatsTabIcon,
  HomeTabIcon,
  MoreTabIcon,
  PlusIcon,
  WalletTabIcon,
} from '@/components/icons';
import { IconButton } from '@/components/IconButton';
import { useBottomSheet } from '@/contexts';
import { resolveSelectedUsers } from '@/features/contacts';
import { colors } from '@/theme';

type CustomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type RouteName = 'index' | 'wallet' | 'chats' | 'calendar' | 'more';

const ACTIVE_COLOR = colors.primary;
const INACTIVE_COLOR = '#3F3F46';

const ICONS: Record<RouteName, (focused: boolean) => ReactNode> = {
  index: (focused) => <HomeTabIcon color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />,
  wallet: (focused) => <WalletTabIcon color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />,
  chats: (focused) =>
    focused ? (
      <IconButton
        accessible={false}
        backgroundColor={colors.primary}
        icon={PlusIcon}
        iconColor={colors.background}
        pointerEvents="none"
      />
    ) : (
      <ChatsTabIcon color={INACTIVE_COLOR} />
    ),
  calendar: (focused) => <CalendarTabIcon color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />,
  more: (focused) => <MoreTabIcon color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />,
};

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const { open } = useBottomSheet();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const options = descriptors[route.key].options;
        const label = typeof options.title === 'string' ? options.title : route.name;

        const onPress = () => {
          if (route.name === 'chats' && isFocused) {
            open({
              type: 'newMessage',
              snapPoints: ['85%'],
              data: {
                onStartChat: (selectedIds) => {
                  const recipients = resolveSelectedUsers(selectedIds);
                  if (recipients.length === 1) {
                    router.push({
                      pathname: '/chats/[chatId]',
                      params: { backTo: '/chats', chatId: recipients[0].id },
                    });
                  } else if (recipients.length > 1) {
                    router.push({
                      pathname: '/chats/bulk',
                      params: { recipientIds: selectedIds.join(',') },
                    });
                  }
                },
              },
            });
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onLongPress={onLongPress}
            onPress={onPress}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}>
            {ICONS[route.name as RouteName](isFocused)}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E4E7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 28,
    paddingTop: 10,
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressed: {
    opacity: 0.65,
  },
});
