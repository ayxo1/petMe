import { images } from "@/constants";
import type { ProfileCardProps } from "@/types/components";
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, ImageBackground, Text, View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const END_POSITION = 0;

const ProfileCard = ({ profileImage, profileName, profileDescription }: ProfileCardProps) => {

  const onLeft = useSharedValue(true);
  const position = useSharedValue(0);

  const gesture = Gesture.Pan()
  .onUpdate((e) => {
    if (onLeft.value) {
      position.value = e.translationX;
    } else {
      position.value = END_POSITION + e.translationX;
    }
  })
  .onEnd((e) => {
    if (position.value > END_POSITION / 2) {
      position.value = withTiming(END_POSITION, { duration: 100 });
      onLeft.value = false;
    } else {
      position.value = withTiming(0, { duration: 100 });
      onLeft.value = true;
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <SafeAreaView
      className="p-3 pb-4 px-5"
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          className="p-2 rounded-lg bg-orange-50"
          style={animatedStyle}
        >
          <View
            className="h-[96.5%] overflow-hidden rounded-lg p-2 mt-2"
          >

            <View 
              className="flex-1 relative"
            >
              <ImageBackground
                source={profileImage}
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
                  className="font-bold text-4xl text-primary text-center"
                  numberOfLines={1}
                >
                  {profileName}
                </Text>
              </View>
            <View
              className="absolute left-0 right-0 bottom-8 h-16 justify-start"
            >
              <Text
                className="text-xl mx-8 text-white"
                numberOfLines={2}
              >
                &#9829; {profileDescription}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      
    </SafeAreaView>
  );
}

export default ProfileCard;