import { Slot } from 'expo-router';
import React from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';


const AuthLayout = () => {
  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}    
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        className='h-full bg-white'
      >
        <View
            className='w-full relative'
            style={{
                height: Dimensions.get('screen').height / 2.25
            }}
        >

        </View>
        <Slot />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AuthLayout