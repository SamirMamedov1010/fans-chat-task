import { forwardRef, type ComponentType } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

export type CustomInputProps = Omit<TextInputProps, 'style'> & {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: ComponentType<SvgProps>;
  leftIconProps?: SvgProps;
};

export const CustomInput = forwardRef<TextInput, CustomInputProps>(function CustomInput(
  {
    autoCapitalize = 'none',
    autoCorrect = false,
    containerStyle,
    inputStyle,
    leftIcon: LeftIcon,
    leftIconProps,
    placeholderTextColor = colors.mutedForeground,
    ...textInputProps
  },
  ref,
) {
  return (
    <View style={[styles.container, containerStyle]}>
      {LeftIcon ? <LeftIcon color={colors.mutedForeground} {...leftIconProps} /> : null}
      <TextInput
        ref={ref}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        placeholderTextColor={placeholderTextColor}
        selectionColor={colors.primary}
        style={[styles.input, inputStyle]}
        underlineColorAndroid="transparent"
        {...textInputProps}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minWidth: 0,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderColor: colors.input,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
  },
  input: {
    minWidth: 0,
    height: '100%',
    flex: 1,
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
