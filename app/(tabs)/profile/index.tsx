import ButtonComponent from '@/components/ButtonComponent';
import Modal from '@/components/Modal';
import { icons } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useFeedStore } from '@/stores/useFeedStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PetSetup from '../../(auth)/pet-setup';

const LogOutButton = ({ signOut }: { signOut: () => void }) => {
  const resetFeedStore = useFeedStore(state => state.reset);

  return (
    <View>
      <ButtonComponent 
        title='sign out'
        onPress={async () => {
          await AsyncStorage.clear();
          resetFeedStore();
          signOut();
        }}
        style='bg-red-600'
        textStyle='color-white'
      />
    </View>
  );
};

const Profile = () => {

  const { user ,signOut } = useAuthStore();
  const [ petSettigsModal, togglePetSettingsModal ] = useState(false);
  const [profileSettingsModal, toggleProfileSettingsModal] = useState(false);

  return (
    <>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View className='flex-row flex-1 justify-between items-center'>            
              <TouchableOpacity className='mb-2'>
                <Image 
                  source={icons.settings}
                  className='size-9'
                  resizeMode='contain'
                  // tintColor={focused ? Colors.secondary : '#000000'}
                />
              </TouchableOpacity>
              <LogOutButton signOut={signOut}/>
            </View>
          )
        }}
      />
      <ScrollView
        className='p-5 flex-1 max-h-[95%]'
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ paddingBottom: 40, alignItems: 'center', justifyContent: 'center' }}
      >
        <View>
          {/* profile preview */}
          <View className='flex-row justify-center gap-6 m-4'>
            <TouchableOpacity
              className='p-2 bg-secondary rounded-2xl'
            >
              <Text className='text-white'>edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 bg-secondary rounded-2xl ${petSettigsModal && 'bg-slate-400'}`}
              onPress={() => togglePetSettingsModal(!petSettigsModal)}
            >
              <Text className='text-white'>add/edit pets</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View
          className='bg-slate-100 rounded-xl'
        >
          {petSettigsModal && (
            <View
              // keyboardShouldPersistTaps='handled'
              // className='h-[80%] w-full'
              // contentContainerStyle={{ flexGrow: 1 }}
            >

              <PetSetup />
            </View>
          )}
        </View>
      </ScrollView>
    </>
  )
}

export default Profile