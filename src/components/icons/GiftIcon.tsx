import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Mask, Path, type SvgProps } from 'react-native-svg';

export function GiftIcon({ color = '#8258DE', ...props }: SvgProps) {
  const id = useId().replaceAll(':', '-');
  const clipPathId = `gift-clip-${id}`;
  const maskId = `gift-mask-${id}`;

  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <G clipPath={`url(#${clipPathId})`}>
        <Mask id={maskId} width={16} height={16} x={0} y={0} maskUnits="userSpaceOnUse">
          <Path fill="#fff" stroke="#fff" strokeWidth={1.33} d="M15.335.665v14.67H.665V.665h14.67Z" />
        </Mask>
        <G
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          strokeWidth={1.33}
          mask={`url(#${maskId})`}>
          <Path d="M12.927 8.707v4.22c0 .773-.634 1.407-1.407 1.407H4.48a1.411 1.411 0 0 1-1.407-1.407v-4.22h9.854Z" />
          <Path d="M14.334 6.36v1.174c0 .647-.634 1.174-1.407 1.174H3.074c-.774 0-1.407-.527-1.407-1.174V6.361c0-.647.633-1.173 1.407-1.173h9.853c.773 0 1.407.526 1.407 1.173Z" />
          <Path d="M6.427 5.1c1.407.274 1.76-.066 1.493-1.492C7.607 1.94 5.96 1.1 4.954 2.094c-1.02 1-.18 2.687 1.473 3.007Z" />
          <Path d="M9.574 5.1c-1.407.274-1.76-.066-1.494-1.492.314-1.667 1.96-2.507 2.967-1.514 1.02 1 .18 2.687-1.473 3.007Z" />
        </G>
      </G>
      <Defs>
        <ClipPath id={clipPathId}>
          <Path fill="#fff" d="M0 0h16v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
