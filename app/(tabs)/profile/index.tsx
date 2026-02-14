import ButtonComponent from '@/components/ButtonComponent';
import { icons } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { useChatStore } from '@/stores/useChatStore';
import { useFeedStore } from '@/stores/useFeedStore';
import { useLikesStore } from '@/stores/useLikesStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AuthRoute = '/(auth)/profile-setup' | '/(auth)/pet-setup';

const LogOutButton = ({ signOut }: { signOut: () => void }) => {
  const resetFeedStore = useFeedStore(state => state.reset);
  const resetLikesStore = useLikesStore(state => state.reset);
  const resetPetStore = usePetStore(state => state.reset);
  const resetChatStore = useChatStore(state => state.reset);
 
  return (
    <View>
      <ButtonComponent 
        title='sign out'
        onPress={async () => {
          await resetChatStore();
          await resetLikesStore();
          
          resetFeedStore();
          resetPetStore();

          await AsyncStorage.clear();
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
  const { pets, hydratePets } = usePetStore();
  const unsubChat = useChatStore(state => state.unsubscribeChat);
  const unsubLikes = useLikesStore(state => state.unsubscribeLikes);

  const cleanUpBeforeNavigation = async (path: AuthRoute, params?: Record<string, string>) => {
    if (unsubChat) await unsubChat();
    if (unsubLikes) await unsubLikes();

    if (params) {
      router.replace({ pathname: path, params });
    } else router.replace(path);
  }

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
          <View className='flex-row justify-center gap-6 m-4 items-center'>
            <TouchableOpacity
              className='p-2 border border-secondary rounded-2xl items-center'
              onPress={async() => {
                await cleanUpBeforeNavigation('/(auth)/profile-setup', { initialData: '1' })
                // router.replace({
                //   pathname: '/(auth)/profile-setup',
                //   params: { initialData: '1' }
                // })
              }}
            >
              <Image
                source={{uri: user.images[0]}}
                style={{ 
                  width: 60,
                  height: 60,
                  borderRadius: 20
                }}
              />
              <Text className='text-secondary'>edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 border border-secondary rounded-2xl ${petSettigsModal && ' bg-red-300'}`}
              onPress={async () => {
                if (!petSettigsModal) await hydratePets(user.id);
                togglePetSettingsModal(!petSettigsModal);
              }}
              // onPress={() => router.replace('/(auth)/pet-setup')}
            >
              <Text className={` ${petSettigsModal ? 'text-white' : 'text-secondary'}`}>add/edit pets</Text>
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
                <View className='bg-primary gap-1'>
                  <FlatList
                    data={pets}
                    horizontal
                    contentContainerStyle={{ gap: 10, padding: 10 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View>
                          <TouchableOpacity
                            className='absolute z-10 border border-green-400 rounded-full p-1 left-24 top-1 size-8 bg-green-300/60'
                            onPress={async () => {
                              await cleanUpBeforeNavigation(('/(auth)/pet-setup'), { id: item.id })
                              // router.replace({
                              //   pathname: '/(auth)/pet-setup',
                              //   params: { id: item.id }
                              // })
                            }}
                          >
                            <Text>✏️</Text>
                          </TouchableOpacity>
                          <View
                            className='shadow rounded-full'
                            style={{ elevation: 5 }}
                          >
                            <Image
                              source={{uri: item.images[0]}}
                              style={{ 
                                width: 115,
                                height: 115,
                                borderRadius: 20
                              }}
                            />
                          </View>
                        </View>
                    )}
                  />
                  <TouchableOpacity
                    style={{ 
                      width: 114,
                      height: 114,
                      borderRadius: 20,
                      borderWidth: 1,
                      padding: 10,
                      marginLeft: 10
                    }}
                    onPress={async () => {
                      await cleanUpBeforeNavigation(('/(auth)/pet-setup'))
                      // router.replace('/(auth)/pet-setup')
                    }}
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

export default Profile;