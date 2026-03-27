import Index from '@/app/(tabs)/index';
import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Rescue = () => {
  return (
    <SafeAreaView
          edges={['top']}
          className='flex-1 p-2'
        >
        <View className='absolute top-12 left-6 z-50'>
          <TouchableOpacity
              onPress={() => router.back()}
          >
            <Image
              source={icons.backIcon}
              className='size-9'
              resizeMode='contain'
              tintColor={Colors.secondary}
            />
          </TouchableOpacity>
        </View>
        <Index />
    </SafeAreaView>
  )
}

export default Rescue;