import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

export const CHATS_HEADER_HEIGHT = 60;

export function useAnimatedOnScroll() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = Math.max(event.contentOffset.y, 0);
    },
  });

  return { scrollHandler, scrollY };
}
