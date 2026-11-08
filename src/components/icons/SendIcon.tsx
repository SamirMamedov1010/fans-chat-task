import Svg, { Path, type SvgProps } from 'react-native-svg';

export function SendIcon({ color = '#FAFAFA', ...props }: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m6.34 2.82 5.707 2.852c2.56 1.28 2.56 3.374 0 4.654L6.34 13.179C2.5 15.1.934 13.526 2.854 9.692l.58-1.153c.146-.293.146-.78 0-1.073l-.58-1.16C.934 2.472 2.507.899 6.34 2.819ZM3.627 8h3.6"
      />
    </Svg>
  );
}
