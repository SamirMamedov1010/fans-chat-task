import Svg, { Path, type SvgProps } from 'react-native-svg';

export function CloseIcon({ color = '#18181B', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m4 4 8 8M12 4l-8 8"
      />
    </Svg>
  );
}
