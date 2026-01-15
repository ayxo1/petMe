import ButtonComponent from '@/components/ButtonComponent';
import PetForm from '@/components/pets/PetForm';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { PetFormData } from '@/types/pets';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PetSetup = () => {

  const { pets, addPet, updatePet } = usePetStore();
  const { setRegistrationState, registrationState } = useAuthStore();

  const { id } = useLocalSearchParams<{ id: string }>();
  const petToEdit = pets.find(pet => pet.id === id);
  const isEditing = !!petToEdit


  const onSubmit = async (data: PetFormData) => {
    // console.log(data);
    if (isEditing) {

      try {

        await updatePet(id, data);

        Alert.alert(
          'success!',
          `${data.name} is successfully updated!`,
          [
            {text: 'done', onPress: () => router.replace('/')}
          ]
        );

      } catch (error) {
        console.log('updatePet pet-setup error:', error);
        Alert.alert('error', 'failed to update the pet, try again');
      }

    } else {

      try {

        await addPet(data);
  
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

        Alert.alert('error', 'failed to add the pet, try again');
        console.log(error, 'error adding the pet');

      }
    }
  };

  return (
    <SafeAreaView className='flex-1 gap-2 mt-4'>
      {/* {registrationState === 'completed' && (     
        <View >
          <TouchableOpacity
              onPress={() => router.replace('/(tabs)/profile')}
          >
              <Image
                  source={icons.backIcon}
                  className='size-9'
                  resizeMode='contain'
                  tintColor={Colors.secondary}
              />
          </TouchableOpacity>
        </View>
      )} */}
      {registrationState !== 'completed' ? (
        <>
          <Text className='font-bold text-xl color-gray-400 text-center mb-4'>now it is time to add a profile for your pet!</Text>
          <Text className='text-base text-center text-gray-400 font-light mb-4'>(you will be able to add more pets from your profile)</Text>
        </>
      ) : (
        <Text className='font-bold text-xl color-gray-400 text-center mb-4'>
          add a new pet
        </Text>
      )}
      <View 
        className='flex-1'
        // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={100}
      >
        <PetForm
          initialData={petToEdit}
          onSubmit={onSubmit}
        />
        {registrationState === 'completed' && (
          <ButtonComponent 
            title='back'
            onPress={() => router.replace('/(tabs)/profile')}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default PetSetup;