import ProfileCard from "@/components/ProfileCard";
import { images } from "@/constants";
import type { ProfileCardProps } from "@/type";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
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
