import Svg, { Path, type SvgProps } from 'react-native-svg';

export function ArrowRightIcon({ color = '#FAFAFA', ...props }: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h14m-5-5 5 5-5 5" />
    </Svg>
  );
}
