import ButtonComponent from '@/components/ButtonComponent';
import PetForm from '@/components/pets/PetForm';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { PetFormData } from '@/types/pets';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PetSetup = () => {

  const { addPet } = usePetStore();
  const { setRegistrationState, registrationState } = useAuthStore();

  const onSubmit = async (data: PetFormData) => {
    // console.log(data);
    try {
      await addPet(data);

      console.log(usePetStore.getState().pets);

      Alert.alert(
        'success!',
        `${data.name} is successfully added!`,
        [
          {text: 'add another', onPress: () => router.replace('/(tabs)/profile')},
          {text: 'done', onPress: () => router.replace('/')}
        ]
      );

      if(registrationState !== 'completed') setRegistrationState('completed');
    } catch (error) {
      Alert.alert('error', 'failed to add pet, try again');
      console.log(error, 'error adding pet');
    };
  };

  return (
    <SafeAreaView className='flex-1 gap-2'>
      {registrationState !== 'completed' ? (
        <>
          <Text className='font-bold text-xl color-gray-400 text-center'>now it is time to add a profile for your pet!</Text>
          <Text className='text-base text-center text-gray-400 font-light'>(you will be able to add more pets from your profile)</Text>
        </>
      ) : (
        <Text className='font-bold text-xl color-gray-400 text-center'>
          add a new pet
        </Text>
      )}
      <PetForm 
        onSubmit={onSubmit}
      />
      {registrationState === 'completed' && (
        <ButtonComponent 
          title='back'
          onPress={() => router.replace('/(tabs)/profile')}
        />
      )}
    </SafeAreaView>
  )
}

export default PetSetup;