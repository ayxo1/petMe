import { petsAPI } from '@/backend/config/pocketbase';
import Modal from '@/components/Modal';
import ProfileCard from '@/components/ProfileCard';
import Colors from '@/constants/Colors';
import { convertPBPetToPetProfile } from '@/stores/petStore';
import { useLikesStore } from '@/stores/useLikesStore';
import { FeedProfile, IncomingLikeFeedProfile } from '@/types/feed';
import { PetProfile } from '@/types/pets';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Image, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width / 2) - 24;

const Likes = () => {

  const { fetchIncomingLikesProfiles, incomingLikes } = useLikesStore();
  const [selectedPets, setSelectedPets] = useState<PetProfile[]>();

  const [selectedProfile, setSelectedProfile] = useState<IncomingLikeFeedProfile | null>();
  const [selectedPetProfile, setSelectedPetProfile] = useState<PetProfile | null>();

  const [selectedPetsLoading, toggleselectedPetsLoading] = useState(false);
  const [activePetListOwnerId, setActivePetListOwnerId] = useState<string | null>();

  const fetchPetListProfiles = async (ownerId: string) => {
    try {
      toggleselectedPetsLoading(true);
      const pbPets = await petsAPI.getUserPets(ownerId);
      const pets = pbPets.map(convertPBPetToPetProfile);
      setSelectedPets(pets);
      toggleselectedPetsLoading(false);
    } catch (error) {
      console.log('fetchPetListProfiles error: ', error);
      toggleselectedPetsLoading(false);
    }
  };
  // console.log(selectedPets[1].name);
  

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        
        try {
          if (incomingLikes.length === 0) {
            await fetchIncomingLikesProfiles();
            console.log('usecallback log: ',incomingLikes);
          }

          
        } catch (error) {
          console.log('error fetching incomingLikes: ', error);
          
        }
      }
      init();      
    }, [])
  )

  return (
    <SafeAreaView
      edges={['top']}
    >
      <Modal 
        isOpen={!!selectedProfile}
        toggleModal={() => setSelectedProfile(null)}
        styleProps='bg-transparent px-6'
      >
        {selectedProfile && (
          <View
            className='w-full aspect-[0.55]'
            // style={{ aspectRatio: 0.58 }}
          >
            <ProfileCard 
              profileImages={selectedProfile.images}
              profileName={selectedProfile.name}
              profileDescription={selectedProfile.bio}
              indexes={{index: 0, reverseIndex: 0, currentIndex: 0}}
              />
          </View>
        )}
      </Modal>

      <Modal 
        isOpen={!!selectedPetProfile}
        toggleModal={() => setSelectedPetProfile(null)}
        styleProps='bg-transparent px-6'
      >
        {selectedPetProfile && (
          <View
            className='w-full aspect-[0.55]'
            // style={{ aspectRatio: 0.58 }}
          >
            <ProfileCard 
              profileImages={selectedPetProfile.images}
              profileName={selectedPetProfile.name}
              profileDescription={selectedPetProfile.bio}
              indexes={{index: 0, reverseIndex: 0, currentIndex: 0}}
              />
          </View>
        )}
      </Modal>

      <View className='items-center'>

        <FlatList
          data={incomingLikes}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <View className='items-center rounded-3xl border-b border-secondary/20 max-w-[50%]'>

              <TouchableHighlight
                underlayColor={`${Colors.authPrimary}`}
                onPress={() => setSelectedProfile(item)}
                style={{ width: ITEM_WIDTH }}
                className='rounded-2xl'
              >
                <View className='justify-center items-center p-2'>
                  <View 
                    className='shadow rounded-full'
                    style={{ elevation: 5 }}
                  >
                    <Image
                      source={{uri: item.images[0]}}
                      className='w-44 h-44 rounded-full border border-secondary/40'
                    />
                  </View>
                  <Text
                    className='absolute top-2 right-5 border border-secondary/20 rounded-xl px-2 py-1 bg-authPrimary/40'
                  >{item.type}</Text>
                  <View className='items-center'>
                    <View className='flex-row items-center gap-2'>
                      <Text className='text-xl'>
                        {item.name}
                      </Text>
                    </View>
                    <Text className='text-base text-secondary' numberOfLines={2}>liked {item.likedTargetName}</Text>
                  </View>
                </View>
              </TouchableHighlight>

              <View className='justify-center items-center p-2'>
                {item.type === 'owner' && (
                  <TouchableOpacity
                    disabled={selectedPetsLoading}
                    onPress={async () => {
                      // if (!renderPetList) {
                      //   await fetchPetListProfiles(item.id);
                      // }
                      // toggleRenderPetList(!renderPetList);
                      if (activePetListOwnerId === item.id) {
                        setActivePetListOwnerId(null);
                      } else {
                        await fetchPetListProfiles(item.id);
                        setActivePetListOwnerId(item.id);
                      }
                    }}
                    className={`mt- mb-2 p-2 border border-secondary rounded-2xl ${activePetListOwnerId === item.id && 'bg-red-300'}`}
                  >
                    <Text>
                      {activePetListOwnerId === item.id ? 'close' : 'view pets'}
                    </Text>
                  </TouchableOpacity>
                )}

              </View>

            </View>
          )}
        />

        <View 
          className='flex-row pt-2'
        >
          {/* {activePetListOwnerId && selectedPets && (
          <View
            className='absolute overflow-y-hidden top-0 w-full border-t border-secondary/40'
            style={{
              // elevation: 10,
              boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Text>{}</Text>
          </View>
          )} */}
          {activePetListOwnerId && selectedPets && (
            <View
              className='w-full pt-5 -mt-10 overflow-hidden'
            >

              <View 
                className="pt-2 border-t border-secondary/20 bg-primary w-full" 
                style={{ 
                  elevation: 20, 
                  shadowColor: '#7a7773',
                  shadowOffset: { width: 0, height: -5 },
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                }}
              >
                <View>
                  <Text
                    className='text-xl font-bold text-secondary text-center'
                  >{(incomingLikes.find(incProfile => incProfile.id === activePetListOwnerId))?.name || 'selected owner'}'s pets</Text>
                </View>
                <FlatList
                  data={selectedPets}
                  horizontal
                  contentContainerStyle={{ gap: 10, padding: 10 }}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => setSelectedPetProfile(item)}
                      className='ml-1.5 max-w-32'
                    >
                      <View
                        className='shadow rounded-full'
                        style={{ elevation: 5 }}
                      >
                        <Image
                          source={{uri: item.images[0]}}
                          style={{ 
                            width: 120,
                            height: 120,
                            borderRadius: 20
                          }}
                        />
                      </View>
                      <Text className='text-center text-secondary font-bold p-2' numberOfLines={1} ellipsizeMode='tail'>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  )
};

export default Likes;