import { icons, images } from "@/constants";
import type { ProfileCardProps } from "@/types/components";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from "react";
import { Dimensions, ImageBackground, ImageSourcePropType, Text, View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from 'react-native-worklets';
import { TiltEffect } from "./holoCard/TiltEffect";
import ProfileInterface from "./ProfileInterface";

interface ProfileCardPropsWithIndex extends ProfileCardProps {
  indexes: {
    index: number;
    reverseIndex: number;
    currentIndex: number;
  };
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

const { width: wWidth, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = wWidth * 0.15;

const SNAP_POINTS = [-wWidth, 0, wWidth];
const aspectRatio = 722 / 368;
const CARD_WIDTH = wWidth - 128;
const CARD_HEIGHT = CARD_WIDTH * aspectRatio;
const IMAGE_WIDTH = CARD_WIDTH * 0.9;
const DURATION = 300;

const END_POSITION = 0;

const ProfileCard = ({ profileImages, profileName, profileDescription, profileType, distance, indexes, onSwipeLeft, onSwipeRight }: ProfileCardPropsWithIndex) => {

  const offset = useSharedValue({ x: 0, y: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-height);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(indexes.index === indexes.currentIndex ? 0 : Math.random() * 10);

  useEffect(() => {
    const delay = indexes.reverseIndex * DURATION
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: DURATION,
        easing: Easing.inOut(Easing.ease)
      })
    )
  }, [indexes.reverseIndex, translateY]);

  useEffect(() => {
    if(indexes.index === indexes.currentIndex) {
      rotateZ.value = withTiming(0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease)
      })
    
    };
  }, [indexes, rotateZ])



  const gesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
    translateY.value = e.translationY;

    scale.value = interpolate(
      Math.abs(e.translationX),
      [0, SWIPE_THRESHOLD],
      [1, 0.90]
    )
  })
  .onEnd((e) => {
    const swipedRight = e.translationX > SWIPE_THRESHOLD;
    const swipedLeft = e.translationX < -SWIPE_THRESHOLD;
    console.log({right: swipedRight, left: swipedLeft});
    
    
    if(swipedRight || swipedLeft) {
      
      translateX.value = withTiming(e.translationX + (swipedRight ? 400 : -400), { duration: 300 });

      scale.value = withTiming(0, { duration: 300 }, (finished) => {
        try {
          if(finished && swipedLeft && onSwipeLeft) {
            scheduleOnRN(onSwipeLeft);
          } else if(finished && onSwipeRight && onSwipeLeft) {
            scheduleOnRN(onSwipeRight);
          }
        } catch (error) {
          console.warn('scheduleOnRN swipeLeft error', error);
        }
      });
    } else {
      scale.value = withTiming(1, {
          duration: 100,
          easing: Easing.inOut(Easing.ease)
        });
        translateX.value = withTiming(END_POSITION, { duration: 250,
        easing: Easing.inOut(Easing.ease) 
      });
        translateY.value = withTiming(END_POSITION, { duration: 250,
        easing: Easing.inOut(Easing.ease) 
      });

    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }));  

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1]
    ),
  }));

  const dislikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0]
    ),
  }));

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={animatedStyle}
        >
          
        <TiltEffect>

         <Animated.View
          style={[
            likeOverlayStyle,
            {
              position: 'absolute',
              top: '15%',
              right: '20%',
              zIndex: 10,
            },
          ]}
          pointerEvents="none"
        >
          <View>
            <Text className="text-red-500 text-3xl">{'<3'}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            dislikeOverlayStyle,
            {
              position: 'absolute',
              top: '15%',
              left: '20%',
              zIndex: 10,
            },
          ]}
          pointerEvents="none"
        >
          <View>
            <Text className="text-red-500 text-3xl">{'</3'}</Text>
          </View>
        </Animated.View>
          
          <ProfileInterface
            profileImages={profileImages}
            profileName={profileName}
            profileDescription={profileDescription}
            profileType={profileType}
            distance={distance}
          />

        </TiltEffect>
        
        </Animated.View>
      </GestureDetector>
      
    </View>
  );
}

export default ProfileCard;