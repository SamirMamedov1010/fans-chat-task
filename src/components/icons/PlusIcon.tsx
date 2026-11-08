import Svg, { Path, type SvgProps } from 'react-native-svg';

export function PlusIcon({ color = '#18181B', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.333 8h9.333M8 3.335v9.333"
      />
    </Svg>
  );
}
