import Svg, { Path, type SvgProps } from 'react-native-svg';

export function HeartIcon({ color = '#A1A1AA', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.33}
        d="M8.413 13.873c-.227.08-.6.08-.827 0-1.933-.66-6.253-3.413-6.253-8.08 0-2.06 1.66-3.727 3.707-3.727 1.213 0 2.286.587 2.96 1.494a3.686 3.686 0 0 1 2.96-1.494c2.046 0 3.706 1.667 3.706 3.727 0 4.667-4.32 7.42-6.253 8.08Z"
      />
    </Svg>
  );
}
