import { Image, type ImageProps } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

export type AvatarStatus = 'online' | 'offline';

export type AvatarProps = {
  source: ImageProps['source'];
  size?: number;
  status?: AvatarStatus;
  statusSize?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  accessibilityLabel,
  size = 40,
  source,
  status,
  statusSize = 16,
  style,
}: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        accessibilityLabel={accessibilityLabel}
        contentFit="cover"
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />

      {status ? (
        <View
          accessibilityLabel={status === 'online' ? 'Online' : 'Offline'}
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
            },
            status === 'online' ? styles.statusOnline : styles.statusOffline,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
  },
  status: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: colors.background,
  },
  statusOnline: {
    backgroundColor: colors.status.online,
  },
  statusOffline: {
    backgroundColor: colors.status.offline,
  },
});
