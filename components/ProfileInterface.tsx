import { images } from "@/constants";
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { ImageBackground, ImageSourcePropType, Pressable, Text, View } from "react-native";

interface ProfileInterfaceProps {
    profileImages: string[];
    profileName: string;
    profileDescription: string;
    profileType?: string
    distance?: string;
};

const ProfileInterface = ({ profileImages, profileName, profileDescription, profileType, distance }: ProfileInterfaceProps) => {

  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const profileCover: ImageSourcePropType = { uri: profileImages[currentImageIdx] }

  return (
    <View
    className="h-[96.5%] overflow-hidden rounded-lg p-2 mt-6"
    >

        <View 
            className="flex-1 relative bg-primary"
        >
            <View className="flex-row justify-center gap-2">
                {profileType && profileType === 'seeker' && (
                    <Text className="absolute text-center text-primary/80 text-xl z-50 top-16 right-8 bg-authPrimary/50 px-2 py-1 rounded-xl">
                        seeker
                    </Text>
                )}
            </View>

            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setCurrentImageIdx(prev => ((prev + 1) === profileImages.length ? 0 : prev + 1));
                }}
            >

                <Image 
                    source={profileCover}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    contentFit='cover'
                    cachePolicy="memory-disk"
                    placeholder={images.mrBigBlurhash}
                    // placeholder={blurhash}
                    transition={50}
                />

                <LinearGradient 
                    colors={['transparent', 'rgba(40, 40, 40, .9)']}
                    start={{ x: 0, y: 0.7 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                    height: '100%',
                    width: '100%',
                    }}
                />

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