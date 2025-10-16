import PetForm from '@/components/pets/PetForm';
import React from 'react';
import { View } from 'react-native';

const PetSetup = () => {

    const onSubmit = () => {

    }

  return (
    <View>
      <PetForm 
        onSubmit={onSubmit}
      />
    </View>
  )
}

export default PetSetup;