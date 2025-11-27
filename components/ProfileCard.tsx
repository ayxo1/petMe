import { icons, images } from "@/constants";
import type { ProfileCardProps } from "@/types/components";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from "react";
import { Dimensions, ImageBackground, Text, View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from 'react-native-worklets';
import { TiltEffect } from "./holoCard/TiltEffect";

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
const SWIPE_THRESHOLD = wWidth * 0.4;

const SNAP_POINTS = [-wWidth, 0, wWidth];
const aspectRatio = 722 / 368;
const CARD_WIDTH = wWidth - 128;
const CARD_HEIGHT = CARD_WIDTH * aspectRatio;
const IMAGE_WIDTH = CARD_WIDTH * 0.9;
const DURATION = 300;

const END_POSITION = 0;

const ProfileCard = ({ profileImages, profileName, profileDescription, indexes, onSwipeLeft, onSwipeRight }: ProfileCardPropsWithIndex) => {
  // console.log(indexes);
  

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

  return (
    <SafeAreaView
      className="p-3 pb-4 px-5"
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          // className="p-2 rounded-lg bg-orange-50"
          // className="p-2 rounded-lg"
          style={animatedStyle}
        >
          
         <Animated.View
            style={[
              likeOverlayStyle,
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                zIndex: 10,
                // backgroundColor: 'rgba(34, 197, 94, 0.9)',
                // paddingHorizontal: 20,
                // paddingVertical: 10,
                // borderRadius: 8,
                // transform: [{ rotate: '-15deg' }],
              },
          ]}
          pointerEvents="none"
        >
            {/* <Text className="">❤️</Text> */}
            <View className="size-full">
              <Image 
              source={icons.dogLike} 
              className="size-full"
              contentFit="contain"
              />
            </View>
        </Animated.View>

        <TiltEffect>

          <View
            className="h-[98%] overflow-hidden rounded-lg p-2 mt-2"
          >

            <View 
              className="flex-1 relative"
            >
              {/* <ImageBackground
                source={profileImages[0]}
                className="size-full"
                resizeMode="cover"
              > */}
              <ImageBackground
                source={profileImages[0]}
                className="size-full"
                resizeMode="cover"
              >

                <LinearGradient 
                  colors={['transparent', 'rgba(40, 40, 40, .9)']}
                  start={{ x: 0, y: 0.7 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                />
              </ImageBackground>
            </View>

            <View
              className="absolute inset-0"
              pointerEvents="none"
            >
                <ImageBackground
                  source={images.profileCardBorder}
                  className="size-full"
                  resizeMode="stretch"
                />
            </View>

              <View className="absolute bottom-28 left-0 right-0">
                <Text
                  className="font-bold text-3xl text-primary text-center"
                  numberOfLines={1}
                >
                  {profileName}
                </Text>
              </View>
            <View
              className="absolute left-0 right-0 bottom-8 h-16 justify-start"
            >
              <Text
                className="text-base mx-8 text-white"
                numberOfLines={2}
              >
                &#9829; {profileDescription}
              </Text>
            </View>
          </View>

        </TiltEffect>
        </Animated.View>
      </GestureDetector>
      
    </SafeAreaView>
  );
}

export default ProfileCard;