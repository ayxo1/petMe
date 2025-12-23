import ProfileCard from "@/components/ProfileCard";
import { images } from "@/constants";
import { usePetFeedStore } from "@/stores/petFeedStore";
import { assetPreloader, imagePreloader } from "@/utils/assetPreloader";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const {
    petFeed,
    currentIndex,
    swipeLike,
    swipePass,
    fetchProfileBatch,
    getRemaningPets,
  } = usePetFeedStore();

  const [isPreloading, setIsPreloading] = useState(true);
  const VISIBLE_STACK_SIZE = 5;
  const currentPet = petFeed[currentIndex];
  const remaining = getRemaningPets();
  const visibleCards = petFeed.slice(currentIndex, currentIndex + VISIBLE_STACK_SIZE);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (petFeed.length === 0) {
          await fetchProfileBatch();
        };
        
        const firstBatch = petFeed.slice(0, VISIBLE_STACK_SIZE);
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
      
      const nextBatch = petFeed.slice(currentIndex + VISIBLE_STACK_SIZE, currentIndex + VISIBLE_STACK_SIZE + 5);

      const nextImages = nextBatch
        .flatMap(petProfile => petProfile.images || [])
        .filter(Boolean);

        imagePreloader(nextImages);
    };
  }, [remaining, currentIndex, petFeed]);

  useEffect(() => {
    const dbIp = process.env.EXPO_PUBLIC_POCKETBASE_HOST;
    console.log(`http://${dbIp}:8090/api/health`);
    
    fetch(`http://${dbIp}:8090/api/health`)
    .then(res => res.json())
    .then(data => console.log('pb connected ', data))
    .catch(error => console.error(error));
  }, []);
  
  const onSwipeLeft = () => {
    console.log('swiping left ', currentPet.name);
    if(!currentPet) return;

    swipePass(currentPet.id);
  };

  const onSwipeRight = async () => {
    console.log('swiping right ', currentPet.name);
    if(!currentPet) return;

    const isMatch = await swipeLike(currentPet.id);
    if(isMatch) {
      console.log('it\'s a match ');
    };
  };

  console.log(isPreloading);

  if (isPreloading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b3a38" />
        <Text className="text-gray-600 mt-4 text-lg">Loading pets...</Text>
      </SafeAreaView>
    );
  };

  if(!currentPet || remaining === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-600">
          No more profiles! 🐾
        </Text>
        <Text className="text-gray-500 mt-2">
          Check back later for more pets
        </Text>
      </SafeAreaView>
    );
  };


return (
    <View
      className="flex-1"
    >
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
              indexes={{ index: cardIndex, reverseIndex: petFeed.length - cardIndex - 1, currentIndex }}
              onSwipeLeft={arrIndex === 0 ? onSwipeLeft : undefined}
              onSwipeRight={arrIndex === 0 ? onSwipeRight : undefined}
            />

          </View>
        )
      })}
    </View>
  );
}
