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
const DURATION = 300;
const END_POSITION = 0;
const PAW_WIDTH = 80;
const PAW_HEIGHT = 220;

const ProfileCard = ({ profileImages, profileName, profileDescription, profileType, distance, isAvailableForAdoption, indexes, onSwipeLeft, onSwipeRight }: ProfileCardPropsWithIndex) => {

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-height);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(indexes.index === indexes.currentIndex ? 0 : Math.random() * 10);

  // paw anim
  const pawTranslateX = useSharedValue(wWidth);  // Start off-screen RIGHT
  const pawTranslateY = useSharedValue(0);
  const pawOpacity = useSharedValue(0);
  const pawInitialX = useSharedValue(0);  // renamed from touchY for clarity
  const pawRotation = useSharedValue(0);
  const cardCenterX = wWidth / 2;
  //

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
  .onStart((e) => {
    const fromRight = e.absoluteX > cardCenterX;
    
    pawOpacity.value = 1;
    pawRotation.value = fromRight ? -15 : 15;

    pawInitialX.value = e.absoluteX - (PAW_WIDTH / 2);
    pawTranslateX.value = pawInitialX.value;
    const pawStopY = height * 0.78;
    pawTranslateY.value = height;
    pawTranslateY.value = withTiming(pawStopY, { duration: 200 });
  })
  .onUpdate((e) => {
    translateX.value = e.translationX;

    // uncomment to restore the Y axis swiping
    // translateY.value = e.translationY;
    
    pawTranslateX.value = pawInitialX.value + e.translationX;

    scale.value = interpolate(
      Math.abs(e.translationX),
      [0, SWIPE_THRESHOLD],
      [1, 0.95]
    );
  })
  .onEnd((e) => {
    const swipedRight = e.translationX > SWIPE_THRESHOLD;
    const swipedLeft = e.translationX < -SWIPE_THRESHOLD;
    console.log({right: swipedRight, left: swipedLeft});
    
    if(swipedRight || swipedLeft) {
      
      pawTranslateX.value = withTiming(swipedRight ? wWidth : -wWidth);
      pawOpacity.value = withDelay(200, withTiming(0));

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

      const retreatX = pawRotation.value === -15 ? wWidth : -120;
      pawTranslateX.value = withTiming(retreatX, { duration: 150 });
      pawOpacity.value = withDelay(150, withTiming(0));
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

      <View className="pointer-events-none absolute z-50 size-full">
        <Animated.Image
          source={images.orangePaw}
          style={[
            {
              width: PAW_WIDTH,
              height: PAW_HEIGHT,
            }, 
            useAnimatedStyle(() => ({
              transform: [
                { translateX: pawTranslateX.value },
                { translateY: pawTranslateY.value },
                { rotate: `${pawRotation.value}deg`}
              ],
              opacity: pawOpacity.value
            }))
          ]}
        />
      </View>

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
            isAvailableForAdoption={isAvailableForAdoption}
          />

        </TiltEffect>
        
        </Animated.View>
      </GestureDetector>
      
    </View>
  );
}

export default ProfileCard;