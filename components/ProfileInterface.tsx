import { images } from "@/constants";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { ImageBackground, ImageSourcePropType, Pressable, Text, View } from "react-native";

interface ProfileInterfaceProps {
    profileImages: string[];
    profileName: string;
    profileDescription: string;
    distance?: string;
};

const ProfileInterface = ({ profileImages, profileName, profileDescription, distance }: ProfileInterfaceProps) => {

  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const profileCover: ImageSourcePropType = { uri: profileImages[currentImageIdx] }

  return (
    <View
    className="h-[96.5%] overflow-hidden rounded-lg p-2 mt-6"
    >
        
        <View 
            className="flex-1 relative bg-white"
            
        >
            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
                    setCurrentImageIdx(prev => ((prev + 1) === profileImages.length ? 0 : prev + 1));
                }}
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
            </Pressable>
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

        <View className="absolute bottom-44 left-0 right-0 flex-row justify-center gap-2">
            {profileImages.map((img, idx) => (
                <Text
                    key={img}
                    className={`font-bold text-3xl text-center ${idx === currentImageIdx ? 'text-white' : 'text-white/50'}`}
                >
                    .
                </Text>
            ))}
        </View>

        <View className="absolute bottom-32 left-0 right-0">
            <Text
                className="font-bold text-3xl text-secondary text-center"
                numberOfLines={1}
            >
                {profileName}
            </Text>
        </View>

        {distance && (<View className="absolute bottom-24 left-7 right-0">
            <Text className="text-l text-authPrimary">📍 {distance} away from you</Text>
        </View>)}

        <View
            className="absolute left-0 right-0 bottom-6 h-16 justify-start"
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