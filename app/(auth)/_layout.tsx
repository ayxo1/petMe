import { Slot } from 'expo-router'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'

const AuthLayout = () => {
  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}    
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        className='mb-10'
      >

      </ScrollView>
      <Slot />
    </KeyboardAvoidingView>
  )
}

export default AuthLayout