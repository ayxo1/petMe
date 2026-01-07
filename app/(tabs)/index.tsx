import MatchScreen from "@/components/MatchScreen";
import Modal from "@/components/Modal";
import ProfileCard from "@/components/ProfileCard";
import { images } from "@/constants";
import { useFeedStore } from "@/stores/useFeedStore";
import { assetPreloader, imagePreloader } from "@/utils/assetPreloader";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const {
    feed,
    currentIndex,
    swipeLike,
    swipePass,
    fetchProfileBatch,
    getRemaningProfiles,
  } = useFeedStore();

  const [isPreloading, setIsPreloading] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const VISIBLE_STACK_SIZE = 5;
  const currentProfile = feed[currentIndex];
  const remaining = getRemaningProfiles();
  const visibleCards = feed.slice(currentIndex, currentIndex + VISIBLE_STACK_SIZE);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (feed.length === 0) {
          await fetchProfileBatch();
        };
        
        const firstBatch = feed.slice(0, VISIBLE_STACK_SIZE);
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

  useEffect(() => {
    const dbIp = process.env.EXPO_PUBLIC_POCKETBASE_HOST;
    
    fetch(`http://${dbIp}:8090/api/health`)
    .then(res => res.json())
    .then(data => console.log('pb connected ', data))
    .catch(error => console.error(error));
  }, []);
  
  const onSwipeLeft = () => {
    console.log('swiping left ', currentProfile.name);
    if(!currentProfile) return;

    swipePass(currentProfile.id);
  };

  const onSwipeRight = async () => {
    console.log('swiping right ', currentProfile.name);
    console.log(currentProfile, 'logging currentProfile');
    
    if(!currentProfile) return;

    const isMatch = await swipeLike(currentProfile.id);
    if(isMatch) {
      console.log(isMatch, ' logging isMatch');
      setIsModal(true);
    };
  };

  // console.log(isPreloading);

  // if (isPreloading) {
  //   return (
  //     <SafeAreaView className="flex-1 items-center justify-center">
  //       <ActivityIndicator size="large" color="#3b3a38" />
  //       <Text className="text-gray-600 mt-4 text-lg">Loading pets...</Text>
  //     </SafeAreaView>
  //   );
  // };

  // if(!currentProfile || remaining === 0) {
  //   return (
  //     <SafeAreaView className="flex-1 items-center justify-center">
  //       <Text className="text-2xl font-bold text-gray-600">
  //         No more profiles! 🐾
  //       </Text>
  //       <Text className="text-gray-500 mt-2">
  //         Check back later for more pets
  //       </Text>
  //     </SafeAreaView>
  //   );
  // };


return (
    <View
      className="flex-1"
    >
      <Modal
        isOpen={isModal}
        onRequestClose={() => setIsModal(false)}
        toggleModal={setIsModal}
      > 
        <MatchScreen 
          modalClose={setIsModal}
      />
      </Modal>
      {isPreloading ? (
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b3a38" />
          <Text className="text-gray-600 mt-4 text-lg">Loading pets...</Text>
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
              className="absolute top-0 left-0 right-0 bottom-12"
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
                  profileImages={profile.images || []}
                  profileName={profile.name}
                  profileDescription={profile.bio}
                  indexes={{ index: cardIndex, reverseIndex: feed.length - cardIndex - 1, currentIndex }}
                  onSwipeLeft={arrIndex === 0 ? onSwipeLeft : undefined}
                  onSwipeRight={arrIndex === 0 ? onSwipeRight : undefined}
                />
              </View>
            )
          })}
        </>
      )}
    </View>
  );
}
