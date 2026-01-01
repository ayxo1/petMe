import { Gyroscope } from 'expo-sensors';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

export const TiltEffect = ({ children }: { children: React.ReactNode }) => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    Gyroscope.setUpdateInterval(16); // 60fps

    const subscription = Gyroscope.addListener((data) => {
      
      rotateX.value = withSpring(-data.x * 5.5, {
        damping: 1000,
        stiffness: 55
      });
      
      rotateY.value = withSpring(-data.y * 4.5, {
        damping: 1000,
        stiffness: 45
      });
    });

    return () => subscription.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateX: `${rotateX.value + 5}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
    // backfaceVisibility: 'hidden',
  }));

  return (
    <Animated.View 
    style={animatedStyle}
    >
      {children}
    </Animated.View>
  );
};