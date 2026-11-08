import Svg, { Path, type SvgProps } from 'react-native-svg';

export function MoreVerticalIcon({ color = '#3F3F46', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M8.583 3.333c0 .322-.261.584-.583.584a.584.584 0 0 1-.584-.584c0-.322.262-.583.584-.583.322 0 .583.261.583.583Z"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M8.833 12.667c0 .46-.373.834-.833.834a.834.834 0 0 1-.834-.834c0-.46.374-.833.834-.833.46 0 .833.373.833.833Z"
        fill={color}
        stroke={color}
      />
      <Path
        d="M6.666 8a1.333 1.333 0 1 0 2.667 0 1.333 1.333 0 0 0-2.667 0Z"
        fill={color}
      />
    </Svg>
  );
}
