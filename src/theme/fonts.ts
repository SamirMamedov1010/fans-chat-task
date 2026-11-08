import { Platform } from 'react-native';

export const fontFamilies = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: 'system-ui',
    default: 'System',
  }),
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const lineHeights = {
  sm: 18,
  md: 24,
} as const;
