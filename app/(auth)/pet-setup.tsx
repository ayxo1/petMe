import PetForm from '@/components/pets/PetForm';
import { usePetStore } from '@/stores/petStore';
import { PetFormData } from '@/types/pets';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PetSetup = () => {

  const { addPet } = usePetStore();

  const onSubmit = async (data: PetFormData) => {
    console.log(data);
    try {
      await addPet(data);

      Alert.alert(
        'success!',
        `${data.name} is successfully added!`,
        [
          {text: 'add another', onPress: () => {
            // redirect to profile settings
          }},
          {text: 'done', onPress: () => router.replace('/')}
        ]
      );
    } catch (error) {
      Alert.alert('error', 'failed to add pet, try again');
      console.log(error, 'error adding pet');
    }
    
  };

  return (
    <SafeAreaView className='flex gap-2'>
      <Text className='font-bold text-xl color-gray-400 text-center'>now it is time to add a profile for your pet!</Text>
      <Text className='text-base text-center text-gray-400 font-light'>(you will be able to add more pets from your profile)</Text>
      <PetForm 
        onSubmit={onSubmit}
      />
    </SafeAreaView>
  )
}

export default PetSetup;