import type { ImageProps } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { Avatar, type AvatarStatus } from '@/components/Avatar';
import { BuyingPowerIcon } from '@/components/icons';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export type ChatStatus = AvatarStatus;

type ChatListItemProps = {
  avatarSource: ImageProps['source'];
  displayName: string;
  username: string;
  message: string;
  time: string;
  status: ChatStatus;
  activityAvatarSource?: ImageProps['source'];
  selected?: boolean;
  showBuyingPower?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
};

export function ChatListItem({
  activityAvatarSource,
  avatarSource,
  displayName,
  message,
  onPress,
  selected = false,
  showBuyingPower = true,
  status,
  testID,
  time,
  username,
}: ChatListItemProps) {
  return (
    <Pressable
      accessibilityLabel={`${displayName}, ${username}, ${message}, ${time}`}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.containerSelected,
        pressed && styles.containerPressed,
      ]}
      testID={testID}>
      <Avatar
        accessibilityLabel={`${displayName} avatar`}
        size={40}
        source={avatarSource}
        status={status}
      />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.nameLine}>
          <Text style={styles.displayName}>{displayName}</Text>{' '}
          <Text style={styles.username}>{username}</Text>
        </Text>

        <View style={styles.previewRow}>
          <Text numberOfLines={1} style={styles.message}>
            {message}
          </Text>
          <Text numberOfLines={1} style={styles.time}>
            {' · '}
            {time}
          </Text>
        </View>
      </View>

      <View style={styles.accessories}>
        {activityAvatarSource ? (
          <Avatar accessibilityLabel="Recent activity avatar" size={20} source={activityAvatarSource} />
        ) : null}
        {showBuyingPower ? <BuyingPowerIcon /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  containerSelected: {
    backgroundColor: colors.selected,
  },
  containerPressed: {
    opacity: 0.7,
  },
  content: {
    minWidth: 0,
    flex: 1,
  },
  nameLine: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  displayName: {
    fontWeight: fontWeights.semibold,
  },
  username: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  previewRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    minWidth: 0,
    flexShrink: 1,
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  time: {
    flexShrink: 0,
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  accessories: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
