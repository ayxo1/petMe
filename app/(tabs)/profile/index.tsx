import ButtonComponent from '@/components/ButtonComponent';
import Modal from '@/components/Modal';
import { icons } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { useFeedStore } from '@/stores/useFeedStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageSourcePropType, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  if (!user) return;
  const [ petSettigsModal, togglePetSettingsModal ] = useState(false);
  const [profileSettingsModal, toggleProfileSettingsModal] = useState(false);
  const { pets, hydratePets } = usePetStore();  
  
  // useEffect(() => {
  //   hydratePets(user.id);
    
  // }, []);

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
        className='p-7 flex-1 max-h-[95%]'
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ paddingBottom: 40, alignItems: 'center', justifyContent: 'center' }}
      >
        <View>
          {/* profile preview */}
          <View className='flex-row justify-center gap-6 m-4'>
            <TouchableOpacity
              className='p-2 bg-secondary rounded-2xl'
              onPress={() => router.replace('/(auth)/profile-setup')}
            >
              <Text className='text-white'>edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 bg-secondary rounded-2xl ${petSettigsModal && 'bg-slate-400'}`}
              onPress={async () => {
                if (!petSettigsModal) await hydratePets(user.id);
                togglePetSettingsModal(!petSettigsModal);
              }}
              // onPress={() => router.replace('/(auth)/pet-setup')}
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
              className='flex-row'
            >
              {/* <PetSetup /> */}
              {pets && (
                <View className='grid-flow-row grid-cols-3 bg-primary gap-1'>
                  <FlatList
                    data={pets}
                    horizontal
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className='ml-0.5'>
                          <TouchableOpacity
                            className='absolute z-10 border border-green-400 rounded-full p-1 left-20 top-1 size-8 bg-green-300/60'
                            onPress={() => {
                              router.replace({
                                pathname: '/(auth)/pet-setup',
                                params: { id: item.id }
                              })
                            }}
                          >
                            <Text>✏️</Text>
                          </TouchableOpacity>
                          <Image
                            source={{uri: item.images[0]}}
                            style={{ 
                              width: 100,
                              height: 100,
                              borderRadius: 20
                            }}
                          />
                        </View>
                    )}
                  />
                  <TouchableOpacity
                    style={{ 
                      width: 99,
                      height: 99,
                      borderRadius: 20,
                      borderWidth: 1
                    }}
                    onPress={() => router.replace('/(auth)/pet-setup')}
                  >
                    <Text className='text-center'>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  )
}

export default Profile