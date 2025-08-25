import type { ProfileCardProps } from "@/type";
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Text, View } from "react-native";

const ProfileCard = ({ profileImage, profileName, profileDescription }: ProfileCardProps) => {
  return (
    <>
      <View
        className="h-[96%] rounded-[7rem] overflow-hidden"
      >
          <ImageBackground 
            source={profileImage}
            className="size-full"
          >
            <LinearGradient 
                colors={['transparent', 'rgba(40, 40, 40, .8)']}
                start={{ x: 0, y: 0.7 }}
                end={{ x: 0, y: 1 }}
                style={{
                  height: '100%',
                  width: '100%',
                }}
            />
          </ImageBackground>
      </View>
        <View className="absolute bottom-36 left-0 right-0">
          <Text
            className="font-bold text-4xl text-primary text-center"
            numberOfLines={1}
          >
            {profileName}
          </Text>
        </View>
      <View
        className="absolute  left-0 right-0 bottom-16 h-16 justify-start"
      >
        <Text
          className="text-xl mx-8 text-white"
          numberOfLines={2}
        >
          &#9829; {profileDescription}
        </Text>
      </View>
  </>
  );
}

export default ProfileCard;