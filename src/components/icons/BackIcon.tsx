import Svg, { Path, type SvgProps } from 'react-native-svg';

export function BackIcon({ color = '#18181B', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.33}
        d="M6.38 3.953 2.333 8l4.047 4.046M13.666 8H2.446"
      />
    </Svg>
  );
}
