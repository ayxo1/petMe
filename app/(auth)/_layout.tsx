import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { router, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AuthLayout = () => {
  const pathName = usePathname();
  const isFullScreen = pathName.includes('pet-setup');
  const registrationState = useAuthStore(state => state.registrationState);
  const showBackButton: boolean = registrationState === 'completed' && pathName.includes('pet-setup') || pathName.includes('profile-setup');

  return (
    <KeyboardAvoidingView 
        className='flex-1 bg-primary'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
    >
      {showBackButton && (
        <View className='absolute top-12 left-6 z-50'>
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
      )}
      <ScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={{
            height: isFullScreen ? 0 : Dimensions.get('screen').height / 4
          }}
        >
        </View>
        <View>
          <Slot />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AuthLayout;