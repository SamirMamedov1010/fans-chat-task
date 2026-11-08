import Svg, { Path, type SvgProps } from 'react-native-svg';

export function MoreTabIcon({ color = '#3F3F46', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={color}
        d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      />
    </Svg>
  );
}
