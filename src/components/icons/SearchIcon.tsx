import Svg, { Path, type SvgProps } from 'react-native-svg';

export function SearchIcon({ color = '#737373', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.33}
        d="M7.666 14a6.333 6.333 0 1 0 0-12.666 6.333 6.333 0 0 0 0 12.667Z"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m14.666 14.667-1.333-1.333"
      />
    </Svg>
  );
}
