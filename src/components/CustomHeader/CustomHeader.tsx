import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamilies, fontWeights } from '@/theme';

export type CustomHeaderProps = {
  leftButton: ReactNode;
  title: string;
  rightButton: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  withBorder?: boolean;
};

export function CustomHeader({
  contentStyle,
  leftButton,
  rightButton,
  style,
  title,
  titleStyle,
  withBorder = true,
}: CustomHeaderProps) {
  return (
    <View style={[styles.header, withBorder && styles.headerWithBorder, style]}>
      <View style={[styles.content, contentStyle]}>
        {leftButton}
        <Text accessibilityRole="header" numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>
        {rightButton}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
  },
  headerWithBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  content: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    minWidth: 0,
    flex: 1,
    color: colors.icon,
    fontFamily: fontFamilies.sans,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
  },
});
