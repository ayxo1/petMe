import { pb } from "@/backend/config/pocketbase";
import MatchScreen from "@/components/MatchScreen";
import Modal from "@/components/Modal";
import ProfileCard from "@/components/ProfileCard";
import { images } from "@/constants";
import { useAuthStore } from "@/stores/authStore";
import { convertPBShelterToShelterProfile } from "@/stores/shelterStore";
import { useFeedStore } from "@/stores/useFeedStore";
import { ShelterProfile } from "@/types/auth";
import { PBShelterProfile } from "@/types/pbTypes";
import { assetPreloader, imagePreloader } from "@/utils/assetPreloader";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const user = useAuthStore(state => state.user);
  if (user?.accountType === 'shelter') return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 items-center justify-center p-6 gap-4">
          <Text className="text-2xl font-bold text-gray-600 text-center p-2">
            since shelters can't swipe on seekers and owners directly, here's a picture of mr big
          </Text>
          <Image 
            className="size-1/2"
            source={images.mrBigLike}
            resizeMode="cover"
          />
        </SafeAreaView>
    </View>
  );

  const {
    feed,
    currentIndex,
    swipeLike,
    swipePass,
    fetchProfileBatch,
    getRemaningProfiles,
    reset
  } = useFeedStore();
  
  const [isPreloading, setIsPreloading] = useState(true);

  const [currentShelterProfile, setCurrentShelterProfile] = useState<ShelterProfile | undefined>()
  const [isModal, setIsModal] = useState(false);
  const [isShelterModal, setIsShelterModal] = useState(false);
  const [shelterModalProps, setShelterModalProps] = useState<{ swipedProfileId: string; petName: string; shelterName: string; shelterId: string; }>()
  const [matchScreenProps, setMatchScreenProps] = useState<{ matchId: string; isExisting: boolean, username: string; image: string; }>();

  const VISIBLE_STACK_SIZE = 4;
  const currentProfile = feed[currentIndex];
  const remaining = getRemaningProfiles();
  const visibleCards = feed.slice(currentIndex, currentIndex + VISIBLE_STACK_SIZE);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (feed.length === 0) {
          await fetchProfileBatch();
        };
        
        const freshFeed = useFeedStore.getState().feed;
        const firstBatch = freshFeed.slice(0, VISIBLE_STACK_SIZE);
        const imageUris = firstBatch.flatMap((petProfile) => petProfile.images || []).filter(Boolean);

        await Promise.all([
          imagePreloader(imageUris),
          assetPreloader([images.profileCardBorder])
        ]);

        setIsPreloading(false);
      } catch (error) {
        console.error('initialization error ', error);
        setIsPreloading(false);
      };
    };

    initialize();
  }, []);

  useEffect(() => {
    if(remaining <= 3 && remaining > 0) {
      
      const nextBatch = feed.slice(currentIndex + VISIBLE_STACK_SIZE, currentIndex + VISIBLE_STACK_SIZE + 5);

      const nextImages = nextBatch
        .flatMap(petProfile => petProfile.images || [])
        .filter(Boolean);

        imagePreloader(nextImages);
    };
  }, [remaining, currentIndex, feed]);

  const onSwipeLeft = () => {
    if(!currentProfile) return;

    swipePass(currentProfile.id);
  };

  const onSwipeRight = async () => {    
    if(!currentProfile) return;

    if (currentProfile.isShelterPet) {
      await swipePass(currentProfile.id);
      try {
        const shelterData: { items: PBShelterProfile[] } = await pb.collection('shelters').getList(1, 1, {
          filter: `owner = "${currentProfile.ownerId}"`
        });
        const pbShelterProfile = convertPBShelterToShelterProfile(shelterData.items[0]);
        setCurrentShelterProfile(pbShelterProfile);
        setShelterModalProps({
          swipedProfileId: currentProfile.id,
          petName: currentProfile.name,
          shelterId: shelterData.items[0].id,
          shelterName: shelterData.items[0].name
        });
        setIsShelterModal(true);
      } catch (error) {
        console.error('onSwipeRight, tabs/index, if (currentProfile.isShelterPet) error: ', error);
      }
      return;
    }
    
    const isMatch = (await swipeLike(currentProfile.id));
    
    if(isMatch.isMatch && isMatch.matchId) {
      setMatchScreenProps({
        matchId: isMatch.matchId,
        isExisting: isMatch.isExisting || false,
        username: currentProfile.type === 'pet' ? (currentProfile?.ownerName || '') : currentProfile.name,
        image: currentProfile.type === 'pet' 
          ? `${pb.baseURL}/api/files/users/${currentProfile.ownerId}/${currentProfile.ownerImage}`
          : currentProfile.images[0],
      });
      setIsModal(true);
      reset();
      await fetchProfileBatch();
    };
  };

return (
    <View
      className="flex-1"
    >
      <Modal
        isOpen={isModal}
        toggleModal={setIsModal}
        styleProps="bg-lighterSecondary/80"
      > 
        {matchScreenProps && (
          <MatchScreen
            modalOpen={setIsModal}
            matchScreenProps={matchScreenProps}
          />
        )}
      </Modal>

      {isShelterModal && (
        <Modal
          isOpen={isShelterModal}
          toggleModal={(val) => {
            setIsShelterModal(val);
            
          }}
          styleProps="bg-lighterSecondary/80 border border-authPrimary/30 rounded-3xl"
        > 
          <View className="max-w-[90%] items-center justify-center py-12">
              
            <View>

              <View className="gap-4">
                <Text className="text-xl color-primary text-center font-bold">the pet you swiped on is a member of {shelterModalProps?.shelterName ? `the ${shelterModalProps?.shelterName}` : 'a'} shelter!</Text>
                <Text className="text-l text-center">you can connect with the 
                  <Text className="text-primary font-bold"> {shelterModalProps?.shelterName} </Text>
                  shelter to find out more about {shelterModalProps?.petName}</Text>
              </View>
      
              <View
                className='flex-row justify-center mt-6 gap-4'
              >
                <View
                  className="rounded-xl p-2 bg-secondary/80 shadow shadow-secondary/80"
                >   

                  {currentShelterProfile && (
                    <TouchableOpacity 
                      onPress={() => router.push({
                        pathname: '/shelters/[id]',
                        params: { ...currentShelterProfile }
                      })}
                      onPressOut={() => setIsShelterModal(!isShelterModal)}
                    >
                      <Text className="text-primary">connect with the shelter</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View
                  className="bg-authPrimary/80 rounded-xl p-2 shadow shadow-secondary/60"
                >
                  <Pressable
                    onPress={() => {
                      setIsShelterModal(!isShelterModal);
                    }}
                  >
                    <Text className="text-primary">maybe later</Text>
                  </Pressable>
                </View>

              </View>

              <View className="items-center mt-4">
                <View
                  className="bg-authPrimary/80 rounded-xl p-2 shadow shadow-secondary/60"
                >
                  <Pressable
                    onPress={() => {
                      setIsShelterModal(!isShelterModal);
                    }}
                  >
                    <Text className="text-primary">continue exploring</Text>
                  </Pressable>
                </View>
              </View>

            </View>
          </View>
        </Modal>
      )}
      {isPreloading ? (
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b3a38" />
          <Text className="text-gray-600 mt-4 text-lg">Loading profiles...</Text>
        </SafeAreaView>
      ) : (!currentProfile || remaining === 0) ? (
        <SafeAreaView className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-600">
            No more profiles! 🐾
          </Text>
          <Text className="text-gray-500 mt-2">
            Check back later for more pets
          </Text>
        </SafeAreaView>
      ) : (
        <>
          {visibleCards.map((profile, arrIndex) => {
  
            const cardIndex = currentIndex + arrIndex;
            const zIndex = visibleCards.length - arrIndex;

            return (
              <View 
              key={profile.id}
              className="absolute top-0 left-0 right-0 bottom-12 p-3 pb-4 px-5"
              style={{
                zIndex,
                shadowColor: '#8c8981',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 7,
                elevation: 15,
              }}
              pointerEvents={arrIndex === 0 ? 'auto' : 'none'}
              >
  
                <ProfileCard
                  profile={profile}
                  indexes={{ index: cardIndex, reverseIndex: feed.length - cardIndex - 1, currentIndex }}
                  onSwipeLeft={arrIndex === 0 ? onSwipeLeft : undefined}
                  onSwipeRight={arrIndex === 0 ? onSwipeRight : undefined}
                  isPaw={true}
                />
                
              </View>
            )
          })}
        </>
      )}
    </View>
  );
};