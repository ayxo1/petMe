import ProfileCard from "@/components/ProfileCard";
import { images } from "@/constants";
import type { ProfileCardProps } from "@/types/components";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const dummyProfiles: ProfileCardProps[] = [
  {
    profileImage: images.mrEggPlant,
    profileName: 'mr. Eggplant the first',
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
  },
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
  },
];

const dummyFetch = (): ProfileCardProps => {
  const randomIndex: number = Math.floor(Math.random() * dummyProfiles.length);
  return dummyProfiles[randomIndex]
}

export default function Index() {

  const [profile, setNewProfile] = useState<ProfileCardProps>(
    {
      profileImage: images.mrEggPlant,
      profileName: 'mr. Eggplant',
      profileDescription: 'just a friendly eggplant, definitely without any malicious thoughts'
    }
  );
  
  const onSwipeLeft = () => {
    console.log('swiping left');
  };

  const onSwipeRight = () => {
    console.log('swiping right');
  };


return (
    <View
      className="flex-1"
    >
      {dummyProfiles.map((profile, index) => {
        const reverseIndex = dummyProfiles.length - 1 - index;
        const indexes = { index, reverseIndex }
        return (
          <View 
          key={index}
          className="absolute top-0 left-0 right-0 bottom-8"
          style={{
            zIndex: dummyProfiles.length - index,
            shadowColor: '#8c8981',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 7,
            elevation: 15,
          }}
          >
            <ProfileCard {...profile} indexes={indexes} onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight}/>
          </View>
        )
      })}
    </View>
  );
}
