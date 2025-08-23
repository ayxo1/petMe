import { images } from "@/constants";
import type { ProfileCardProps } from "@/type";
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dummyProfiles: ProfileCardProps[] = [
  {
    profileImage: images.mrEggPlant,
    profileName: 'mr. Eggplant',
    profileDescription: 'just a friendly eggplant, definitely without any malicious thoughts'
  },
  {
    profileImage: images.ket,
    profileName: 'mr. ket',
    profileDescription: 'cool ket from bali just living the life'
  },
  {
    profileImage: images.penthouseKet,
    profileName: 'mr. penthouse',
    profileDescription: 'living luxury life in penthouse, what do you got to offer'
  }
];

const dummyFetch = (): ProfileCardProps => {
  const randomIndex: number = Math.floor(Math.random() * dummyProfiles.length)
  return dummyProfiles[randomIndex]
}

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
          {profileDescription}
        </Text>
      </View>
  </>
  )
}



export default function Index() {

    const [profile, setNewProfile] = useState<ProfileCardProps>(
      {
        profileImage: images.mrEggPlant,
        profileName: 'mr. Eggplant',
        profileDescription: 'just a friendly eggplant, definitely without any malicious thoughts'
      }
    )

return (
  <SafeAreaView
    className="flex-1"
  >
    <TouchableOpacity
      className="mt-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15
      }}
      onPress={() => setNewProfile(dummyFetch)}
    >
      <ProfileCard {...profile}/>
    </TouchableOpacity>
    </SafeAreaView>
  );
}
