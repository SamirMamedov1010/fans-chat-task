import type { ComponentType } from 'react';
import {
  Pressable,
  StyleSheet,
  type ColorValue,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors } from '@/theme';

export type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: ComponentType<SvgProps>;
  backgroundColor?: ColorValue;
  iconColor?: ColorValue;
  iconProps?: Omit<SvgProps, 'color'>;
  size?: number;
  style?: StyleProp<ViewStyle>;
  withInsetShadow?: boolean;
};

export function IconButton({
  backgroundColor = colors.secondary,
  disabled,
  icon: Icon,
  iconColor = colors.icon,
  iconProps,
  size = 36,
  style,
  withInsetShadow = true,
  ...pressableProps
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderRadius: size / 3, height: size, width: size },
        withInsetShadow && styles.insetShadow,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...pressableProps}>
      <Icon color={iconColor} {...iconProps} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  insetShadow: {
    boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
