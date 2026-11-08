import Svg, { Path, type SvgProps } from 'react-native-svg';

export function RemoveAttachmentIcon({ color = '#DC2626', ...props }: SvgProps) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 11c2.75 0 5-2.25 5-5S8.75 1 6 1 1 3.25 1 6s2.25 5 5 5ZM4.585 7.416l2.83-2.83M7.415 7.416l-2.83-2.83"
      />
    </Svg>
  );
}
