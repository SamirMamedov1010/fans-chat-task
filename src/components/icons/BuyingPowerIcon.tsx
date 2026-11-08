import Svg, { ClipPath, Defs, G, Path, type SvgProps } from 'react-native-svg';

export function BuyingPowerIcon(props: SvgProps) {
  return (
    <Svg
      accessibilityLabel="Buying power"
      height={16}
      role="img"
      viewBox="0 0 16 16"
      width={16}
      {...props}>
      <G clipPath="url(#buying-power-clip)">
        <Path
          d="M8 6c1.653 0 3-1.347 3-3S9.653 0 8 0 5 1.347 5 3s1.347 3 3 3Z"
          fill="#D4D4D8"
        />
        <Path
          d="M3 16c1.653 0 3-1.347 3-3s-1.347-3-3-3-3 1.347-3 3 1.347 3 3 3ZM13 16c1.653 0 3-1.347 3-3s-1.347-3-3-3-3 1.347-3 3 1.347 3 3 3Z"
          fill="#16A34A"
        />
      </G>
      <Defs>
        <ClipPath id="buying-power-clip">
          <Path d="M0 0h16v16H0z" fill="#FFFFFF" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
