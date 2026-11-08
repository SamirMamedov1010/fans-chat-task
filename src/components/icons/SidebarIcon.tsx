import Svg, { Path, type SvgProps } from 'react-native-svg';

export function SidebarIcon({ color, ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color ?? '#18181B'}
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M2 4.666h12"
      />
      <Path
        stroke={color ?? '#292D32'}
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M4 8h8M6.667 11.334h2.667"
      />
    </Svg>
  );
}
