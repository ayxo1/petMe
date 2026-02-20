import AvatarComponent from '@/components/AvatarComponent';
import ButtonComponent from '@/components/ButtonComponent';
import Modal from '@/components/Modal';
import ProfileInterface from '@/components/ProfileInterface';
import { icons, images } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { useChatStore } from '@/stores/useChatStore';
import { useFeedStore } from '@/stores/useFeedStore';
import { useLikesStore } from '@/stores/useLikesStore';
import { PetProfile } from '@/types/pets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
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
  const [profilePreview, toggleProfilePreview] = useState(false);
  const [selectedPetProfile, setSelectedPetProfile] = useState<PetProfile | null>();

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
                />
              </TouchableOpacity>
              <LogOutButton signOut={signOut}/>
            </View>
          )
        }}
      />

      {profilePreview && (
        <TouchableOpacity
          onPress={() => toggleProfilePreview(!profilePreview)}
        >
          <Modal
            isOpen={profilePreview}  
            toggleModal={toggleProfilePreview}
            styleProps={`${user ? 'bg-transparent px-6' : 'px-4 bg-white/80'}`}
          >
            <View className='w-full aspect-[0.55]'>
              <ProfileInterface 
                profileImages={user.images}
                profileName={user.username}
                profileDescription={user.bio}
              />
            </View>
          </Modal>
        </TouchableOpacity>
      )}

      {selectedPetProfile && (
        <Modal 
          isOpen={!!selectedPetProfile}
          toggleModal={() => setSelectedPetProfile(null)}
          styleProps='bg-transparent px-6'
        > 
          <View
            className='w-full aspect-[0.55]'
          >
            <ProfileInterface 
              profileImages={selectedPetProfile.images}
              profileName={selectedPetProfile.name}
              profileDescription={selectedPetProfile.bio}
              />
          </View>
        </Modal>
      )}

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
              onPress={() => toggleProfilePreview(!profilePreview)}
            >
              <AvatarComponent 
                uri={user.images[0]}
                style='w-32 h-32 rounded-2xl p-1'
              />
              <Text className='text-secondary'>preview profile</Text>
            </TouchableOpacity>

            <View className='gap-4'>

              <TouchableOpacity
                className='p-2 border border-secondary rounded-2xl'
                onPress={async() => {
                await cleanUpBeforeNavigation('/(auth)/profile-setup', { initialData: '1' })
              }}
              >
                <Text className='text-center text-secondary'>edit profile</Text>
              </TouchableOpacity>

              {user.accountType === 'owner' && (
                <TouchableOpacity
                  className={`p-2 border border-secondary rounded-2xl ${petSettigsModal && ' bg-authPrimary'}`}
                  onPress={async () => {
                    if (!petSettigsModal) await hydratePets(user.id);
                    togglePetSettingsModal(!petSettigsModal);
                  }}
                >
                  <Text className={`text-center ${petSettigsModal ? 'text-white' : 'text-secondary'}`}>add/edit pets</Text>
                </TouchableOpacity>
              )}
 
            </View>

          </View>

        </View>

        <View
          className=' rounded-xl'
        >
          {petSettigsModal && (
            <View>
              <Text className='text-center font-extralight p-2 text-secondary'>tap on the profile icon to preview</Text>
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
                              }}
                            >
                              <Text>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className='shadow rounded-full'
                              style={{ elevation: 5 }}
                              onPress={() => setSelectedPetProfile(item)}
                            >
                              <AvatarComponent 
                                uri={item.images[0]}
                                style='w-32 h-32 rounded-2xl'
                              />
                            </TouchableOpacity>
                          </View>
                      )}
                    />
                    <TouchableOpacity
                      style={{ 
                        width: 112,
                        height: 112,
                        borderRadius: 20,
                        borderWidth: 1,
                        padding: 10,
                        marginLeft: 10
                      }}
                      onPress={async () => {
                        await cleanUpBeforeNavigation(('/(auth)/pet-setup'))
                      }}
                    >
                      <Text className='text-center text-l text-secondary'>+ a new pet</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  )
}

export default Profile;