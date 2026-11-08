import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Mask, Path, type SvgProps } from 'react-native-svg';

export function LocationIcon({ color = '#52525B', ...props }: SvgProps) {
  const id = useId().replaceAll(':', '-');
  const clipId = `location-clip-${id}`;
  const maskId = `location-mask-${id}`;

  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <G clipPath={`url(#${clipId})`}>
        <Mask id={maskId} width={16} height={16} x={0} y={0} maskUnits="userSpaceOnUse">
          <Path fill="#fff" stroke="#fff" strokeWidth={1.33} d="M15.335.665v14.67H.665V.665h14.67Z" />
        </Mask>
        <G
          stroke={color}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={1.33}
          mask={`url(#${maskId})`}>
          <Path d="M8 7.273A2.887 2.887 0 1 0 8 1.5a2.887 2.887 0 0 0 0 5.773ZM8 7.28v4.333M11.613 9.207c1.74.52 2.887 1.4 2.887 2.4 0 1.593-2.913 2.887-6.5 2.887S1.5 13.2 1.5 11.607c0-1 1.147-1.887 2.887-2.4" />
        </G>
      </G>
      <Defs>
        <ClipPath id={clipId}>
          <Path fill="#fff" d="M0 0h16v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
