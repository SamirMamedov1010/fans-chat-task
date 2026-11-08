import type { ComponentType } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type ColorValue,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export type CustomButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  backgroundColor?: ColorValue;
  icon?: ComponentType<SvgProps>;
  iconColor?: ColorValue;
  iconProps?: Omit<SvgProps, 'color'>;
  style?: StyleProp<ViewStyle>;
  textColor?: ColorValue;
  title: string;
  withInsetShadow?: boolean;
};

export function CustomButton({
  backgroundColor = colors.customPrimary100,
  disabled,
  icon: Icon,
  iconColor,
  iconProps,
  style,
  textColor = colors.primary,
  title,
  withInsetShadow = true,
  ...pressableProps
}: CustomButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        withInsetShadow && styles.insetShadow,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...pressableProps}>
      {Icon ? <Icon color={iconColor ?? textColor} {...iconProps} /> : null}
      <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  insetShadow: {
    boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
