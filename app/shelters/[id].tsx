import { pb } from '@/backend/config/pocketbase';
import Modal from '@/components/Modal';
import ProfileInterface from '@/components/ProfileInterface';
import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { convertPBUserToUser, useAuthStore } from '@/stores/authStore';
import { convertPBPetToPetProfile } from '@/stores/petStore';
import { User } from '@/types/auth';
import { PBPet, PBUser } from '@/types/pbTypes';
import { PetProfile } from '@/types/pets';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BackIcon = () => {
  return (
    <View className='absolute top-16 left-6 z-50'>
      <TouchableOpacity
        onPress={() => router.back()}
      >
      <RNImage
        source={icons.backIcon}
        className='size-9'
        resizeMode='contain'
        tintColor={Colors.secondary}
      />
      </TouchableOpacity>
    </View>
  );
};
 
const ShelterPage = () => {
  const user = useAuthStore(state => state.user);
  const params = useLocalSearchParams();
  const { id, image, name, description, address, owner } = params;

  const [shelterOwner, setShelterOwner] = useState<User>();
  const [shelterPets, setShelterPets] = useState<PetProfile[]>([]);
  const [selectedPetProfile, setSelectedPetProfile] = useState<PetProfile | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileShown, toggleIsProfileShown] = useState(false);

  const connectShelter = async () => {
    try {
      const result = await pb.send<{ matchId: string; isExisting: boolean }>('/api/shelter-connect', {
        method: 'POST',
        body: { shelterOwnerId: owner }
      });
      router.push({
        pathname: '/chat/[id]',
        params: { 
          id: result.matchId,
          otherUserName: shelterOwner?.username,
          otherUserImage: shelterOwner?.images[0],
          otherUserId: owner,
          otherUserType: 'shelter'
        }
      });
    } catch (error) {
      console.log('connectShelter error, shelters/[id].tsx: ', error);
      Alert.alert('an error occurred whilte trying to message, please try again');
    }
  };

  useEffect(() => {
    const fetchShelterPets = async () => {
      try {
        setIsLoading(true);
        const pbPets: PBPet[] = await pb.collection('pets').getFullList({
          filter: `owner = "${owner}"`,
        });
        const convertedPets = pbPets.map(convertPBPetToPetProfile);
        setShelterPets(convertedPets);

        if (typeof owner === 'string') {
          const pbOwnerData: PBUser = await pb.collection('users').getOne(owner);
          const convertedOwnerData: User = convertPBUserToUser(pbOwnerData);
          setShelterOwner(convertedOwnerData);
        }
        
      } catch (error) {
        console.log('fetchShelterPets error, shelters/[id].tsx: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShelterPets();
  }, []);

  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 p-2 items-center'
    >
      <BackIcon />

      {isLoading && (
        <ActivityIndicator 
          className='absolute-center'
        />
      )}

      {isProfileShown && (
        <Modal
          isOpen={isProfileShown}
          toggleModal={() => {
            setSelectedPetProfile(null);
            toggleIsProfileShown(false);
          }}
          styleProps='bg-transparent px-6'
        >
          {selectedPetProfile && (
            <View
              className='w-full aspect-[0.55]'
            >
              <ProfileInterface
                profile={{ images: selectedPetProfile.images, name: selectedPetProfile.name, bio: selectedPetProfile.bio }}
              />
            </View>
          )}
        </Modal>
      )}

      <ScrollView
        contentContainerStyle={
          { alignItems: 'center' }
        }
      >

        <View 
          className='bg-primary shadow shadow-secondary/10 rounded-2xl p-4 m-6 w-96 gap-2 items-center'
        >
          <View className='size-36 items-center justify-center'>
            <Image
              source={image}
              contentFit='cover'
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
            />
            {owner !== user?.id ? (
              <TouchableOpacity 
                className='absolute self-center left-40 border border-green-700 rounded-2xl'
                onPress={connectShelter}
              >
                <Text className='p-2 text-green-700'>message</Text>
              </TouchableOpacity>
            ) : null}
          </View>


          <Text className='text-secondary font-bold text-center mb-2'>{name} {owner === user?.id ? '(your shelter)' : null}</Text>

          <View className='items-start gap-4'>
            <Text className='text-secondary font-bold'>
                info: <Text className='font-light text-black/80'>{description}</Text>
            </Text>
            <Text className='text-secondary font-bold'>
              address: <Text className='font-light text-black/80'>{address}</Text>
            </Text>
          </View>
        </View>


        <View className='items-center w-full'>

          {shelterPets.map(item => (
            <TouchableOpacity
              className='w-full p-2'
              key={item.id}
              onPress={() => {
                setSelectedPetProfile(item);
                toggleIsProfileShown(true);
              }}
            >
              <View
                className='w-full flex-row gap-4 items-center bg-primary/90 shadow shadow-secondary/20 rounded-2xl p-1 border border-lighterSecondary/40 max-w-full'
              >

                <View className='size-24'>
                  <Image
                    source={item.images[0]}
                    contentFit='cover'
                    placeholder={images.mrBigBlurhash}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  />
                </View>

                <View className='gap-2 max-w-72'>
                  <Text className='text-secondary font-bold'>{item.name}</Text>
                  <Text className='font-light'>{item.bio}</Text>
                </View>

              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
        
    </SafeAreaView>
  );
};

export default ShelterPage;