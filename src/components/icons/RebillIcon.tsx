import Svg, { Path, type SvgProps } from 'react-native-svg';

export function RebillIcon({ color = '#52525B', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.33} d="M5 5.559h4.933c.594 0 1.067.48 1.067 1.066v1.18" />
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.33} d="M6.127 4.44 5 5.56l1.127 1.126M11 10.44H6.067C5.473 10.44 5 9.96 5 9.373v-1.18" />
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.33} d="M9.873 11.56 11 10.44 9.873 9.312" />
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.33} d="M8 14.667A6.667 6.667 0 1 0 8 1.334a6.667 6.667 0 0 0 0 13.333Z" />
    </Svg>
  );
}
