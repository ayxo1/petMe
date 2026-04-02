import AvatarComponent from '@/components/AvatarComponent';
import BottomSheet from '@/components/BottomSheet';
import ButtonComponent from '@/components/ButtonComponent';
import Modal from '@/components/Modal';
import ProfileInterface from '@/components/ProfileInterface';
import ProfileSettings from '@/components/ProfileSettings';
import { icons } from '@/constants';
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

type AuthRoute = '/(auth)/profile-setup' | '/(auth)/pet-setup' | '/(auth)/shelter-setup';

export const LogOutButton = ({ signOut }: { signOut: () => void }) => {
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
  const { user, signOut, registrationState } = useAuthStore();
  
  const [petSettigsModal, togglePetSettingsModal] = useState(false);
  const [profilePreview, toggleProfilePreview] = useState(false);
  const [selectedPetProfile, setSelectedPetProfile] = useState<PetProfile | null>();
  const [settingsModal, toggleSettingsModal] = useState(false);
  
  const { pets, hydratePets } = usePetStore();
  const unsubChat = useChatStore(state => state.unsubscribeChat);
  const unsubLikes = useLikesStore(state => state.unsubscribeLikes);
  
  const cleanUpBeforeNavigation = async (path: AuthRoute, params?: Record<string, string>) => {
    if (unsubChat) await unsubChat();
    if (unsubLikes) await unsubLikes(); 
    
    if (params) {
      router.push({ pathname: path, params });
    } else router.replace(path);
  }
  
  if (!user) return;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className='flex-row items-center'>            
              <TouchableOpacity className='flex-row mb-2 items-center mt-2 gap-2'
                onPress={() => toggleSettingsModal(!settingsModal)}
              >
                <Text className='font-extralight text-white'>settings</Text>
                <Image 
                  source={icons.settings}
                  className='size-11'
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </View>
          )
        }}
      />

      {settingsModal &&
        <BottomSheet 
          isOpen={settingsModal}  
          toggleModal={toggleSettingsModal}
        >
          <ProfileSettings 
            signOut={signOut}
            modalOpen={settingsModal}
            LogOutButton={() => LogOutButton({ signOut })}
          />
        </BottomSheet>
      }

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
                profile={{ images: user.images, name: user.username, bio: user.bio }}
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
              profile={{ images: selectedPetProfile.images, name: selectedPetProfile.name, bio: selectedPetProfile.bio }}
            />
          </View>
        </Modal>
      )}

      <ScrollView
        className='p-7 flex-1 max-h-[95%]'
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ paddingBottom: 40, alignItems: 'center', justifyContent: 'center' }}
      >
        {registrationState === 'completed' && pets.length === 0 && user.accountType === 'owner' && (
          <View>
            <Text className='text-base text-center color-red-400 border p-4 rounded-2xl border-secondary'>
              🔴 you can add profiles for pets via 'add/edit pets!'
            </Text>
          </View>
        )}
        <View>
          {/* profile preview */}
          <View className='flex-row justify-center m-4 items-center'>
            <View
              className=' rounded-2xl items-center'
            >
              <View className='shadow shadow-secondary/50 mb-2 flex-row items-center gap-6'>
                <TouchableOpacity
                  onPress={() => toggleProfilePreview(!profilePreview)}
                  className='w-32'
                >
                  <AvatarComponent
                    uri={user.images[0]}
                    style='size-32 rounded-2xl p-1'
                  />
                  <Text className='absolute-center-x bottom-1 bg-secondary/60 text-primary rounded-b-2xl px-[0.32rem] p-2'>preview profile</Text>
                </TouchableOpacity>
                <View className='gap-4'>
                  <TouchableOpacity
                    className='p-2 border border-secondary rounded-2xl bg-lighterSecondary/30'
                    onPress={async() => {
                      await cleanUpBeforeNavigation('/(auth)/profile-setup', { initialData: '1' })
                    }}
                  >
                    <Text className='text-center text-secondary'>edit profile</Text>
                  </TouchableOpacity>
                  {user.accountType !== 'seeker' && (
                    <TouchableOpacity
                      className={`p-2 border border-secondary rounded-2xl ${petSettigsModal ? ' bg-authPrimary' : 'bg-lighterSecondary/30'}`}
                      onPress={async () => {
                        if (!petSettigsModal) await hydratePets(user.id);
                        togglePetSettingsModal(!petSettigsModal);
                      }}
                    >
                      <Text className={`text-center ${petSettigsModal ? 'text-white' : 'text-secondary'}`}>add/edit pets</Text>
                    </TouchableOpacity>
                  )}
                  {user.accountType === 'shelter' && (
                    <TouchableOpacity
                      className='p-2 border border-secondary rounded-2xl bg-lighterSecondary/30'
                      onPress={async () => {
                        await cleanUpBeforeNavigation('/(auth)/shelter-setup', { initialData: '1' })
                      }}
                    >
                      <Text className='text-center text-secondary'>edit shelter profile</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View
          className=' rounded-xl'
        >
          {petSettigsModal && (
            <View className=''>
              <Text className='text-center font-extralight p-2 text-secondary'>tap on the pet icon to preview</Text>
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