import Svg, { Path, type SvgProps } from 'react-native-svg';

export function MoreHorizontalIcon({ color = '#18181B', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        d="M3.333 7.416a.584.584 0 1 1 0 1.168.584.584 0 0 1 0-1.168Z"
      />
      <Path
        fill={color}
        stroke={color}
        d="M12.666 7.166a.834.834 0 1 1 0 1.668.834.834 0 0 1 0-1.668Z"
      />
      <Path fill={color} d="M8 9.333a1.333 1.333 0 1 0 0-2.667 1.333 1.333 0 0 0 0 2.667Z" />
    </Svg>
  );
}
