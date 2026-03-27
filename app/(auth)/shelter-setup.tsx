import { shelterAPI } from '@/backend/config/pocketbase';
import ButtonComponent from '@/components/ButtonComponent';
import ShelterForm from '@/components/ShelterForm';
import { useAuthStore } from '@/stores/authStore';
import { useShelterStore } from '@/stores/shelterStore';
import { ShelterProfile } from '@/types/auth';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ShelterSetup = () => {

  const { user, registrationState, updateProfile } = useAuthStore();
  if (!user) return;

  const { shelterProfile, hydrateShelter } = useShelterStore();

  const [isLoading, setIsLoading] = useState(false);

  const { initialData } = useLocalSearchParams<{ initialData: '0' | '1' }>();
  const isEditing = initialData === '1';

  const onSubmit = async (formData: Partial<ShelterProfile>) => {
    const shelterUpdate: Partial<ShelterProfile> = {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      address: formData.address,
    };
    
    if (isEditing && shelterProfile) {
      try {
        await shelterAPI.updateShelterProfile(shelterProfile.id, shelterUpdate);
        await hydrateShelter(user.id);
        Alert.alert(
          'success!',
          `${formData.name} is successfully updated!`,
          [
            {text: 'done', onPress: () => router.replace('/(tabs)/profile')}
          ]
        );
        return;
      } catch (error) {
        console.log('updateShelter, shelter-setup error:', error);
        Alert.alert('error', 'failed to update the shelter, try again');
        throw error;
      }
    } else {
      try {
        console.log(shelterUpdate);
        await shelterAPI.createShelter({...shelterUpdate, owner: user?.id});
        await updateProfile({regState: 'completed'});
        Alert.alert(
          'success!',
          `${formData.name} is successfully added! you can start adding pets in your profile`,
          [
            {text: 'go to your profile', onPress: () => router.replace('/(tabs)/profile')}
          ]
        );
      } catch (error) {
        Alert.alert('error', 'failed to register, please try again');
        console.log(error, 'error registering a shelter');
        throw error;
      }
    }
  };

  return (
    <SafeAreaView className='flex-1 gap-2 mt-4'>
      
      {registrationState !== 'completed' ? (
        <>
          <Text className='font-bold text-xl text-secondary text-center mb-4 p-4'>share a bit about the shelter</Text>
        </>
      ) : (
        <Text className='font-bold text-xl text-secondary text-center mb-4'>
          {isEditing ? `editing ${shelterProfile?.name}'s profile` : 'add a new pet'}
        </Text>
      )}

      {registrationState === 'profile_set_up' && (
        <View className='px-10'>
          <View className='border rounded-xl border-secondary/50 p-4'>
            <Text className='text-center text-secondary mb-2 text-l'>not a shelter representative?</Text>
            <Text className='text-base text-center text-gray-400 mb-4'>you can change the profile type on the profile setup page</Text>
            <ButtonComponent 
              title='go to profile setup'
              onPress={() => router.replace({
                pathname: '/(auth)/profile-setup',
                params: { initialData: '1' }
              })}
            />
          </View>
        </View>
      )}

      <View 
        className='flex-1 h-full'
      >

        <ShelterForm
          onSubmit={onSubmit}
          initialData={isEditing ? {...shelterProfile} : undefined}
        />

        {registrationState === 'completed' && (
          <ButtonComponent
            style="mt-2"
            title='back'
            onPress={() => router.replace('/(tabs)/profile')}
          />
        )}

      </View>
    </SafeAreaView>
  );
};

export default ShelterSetup;