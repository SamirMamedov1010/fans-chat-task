import Svg, { Path, type SvgProps } from 'react-native-svg';

export function VerifiedIcon({ color = '#2563EB', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={color}
        d="m12 1.75 2.36 2.05 3.1-.25.7 3.04 2.63 1.67-1.21 2.87.93 2.97-2.78 1.41-.99 2.96-3.08-.53L12 20.57l-1.66-2.63-3.08.53-.99-2.96-2.78-1.41.93-2.97-1.21-2.87 2.63-1.67.7-3.04 3.1.25L12 1.75Z"
      />
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="m8.7 12.1 2.05 2.05 4.55-4.55"
      />
    </Svg>
  );
}
