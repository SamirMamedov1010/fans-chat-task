import type { ImageProps } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { CustomButton } from '@/components/CustomButton';
import { BuyingPowerIcon, StarIcon } from '@/components/icons';
import { colors, fontFamilies, fontSizes, fontWeights } from '@/theme';

export type ChatHeaderProps = {
  avatarSource: ImageProps['source'];
  displayName: string;
  username: string;
  detailsTitle?: string;
  onDetailsPress?: () => void;
};

export function ChatHeader({
  avatarSource,
  detailsTitle = 'Full Details',
  displayName,
  onDetailsPress,
  username,
}: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <BuyingPowerIcon />
        <Avatar accessibilityLabel={`${displayName} avatar`} size={32} source={avatarSource} />

        <View style={styles.identity}>
          <Text numberOfLines={1} style={styles.displayName}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.username}>
            {username}
          </Text>
        </View>
      </View>

      <CustomButton icon={StarIcon} onPress={onDetailsPress} title={detailsTitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  profile: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  identity: {
    minWidth: 0,
    flex: 1,
    gap: 4,
  },
  displayName: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm,
  },
  username: {
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs,
  },
});
