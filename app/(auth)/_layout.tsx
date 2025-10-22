import { Slot } from 'expo-router';
import React from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';


const AuthLayout = () => {
  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        className='h-full bg-white'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
            className='w-full relative'
            style={{
              // height: Dimensions.get('screen').height / 2.25
              height: Dimensions.get('screen').height / 4
            }}
        >
        </View>
        <Slot />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AuthLayout;