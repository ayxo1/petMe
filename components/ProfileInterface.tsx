import { images } from "@/constants";
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, ImageSourcePropType, Text, View } from "react-native";

interface ProfileInterfaceProps {
    profileImages: string[];
    profileName: string;
    profileDescription: string;
};

const ProfileInterface = ({ profileImages, profileName, profileDescription }: ProfileInterfaceProps) => {

  const profileCover: ImageSourcePropType = { uri: profileImages[0] }

  return (
    <View
    className="h-[96.5%] overflow-hidden rounded-lg p-2 mt-6"
    >
        
        <View 
            className="flex-1 relative bg-white"
        >
            <ImageBackground
            source={profileCover}
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
                className="font-bold text-3xl text-secondary text-center"
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
  );
}

export default ProfileInterface;