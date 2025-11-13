import ProfileCard from "@/components/ProfileCard";
import { usePetFeedStore } from "@/stores/petFeedStore";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {

  const {
    petFeed,
    currentIndex,
    swipeLike,
    swipePass,
    fetchProfileBatch,
    getRemaningPets,
    checkForMatch,
    reset
  } = usePetFeedStore();

  const VISIBLE_STACK_SIZE = 5;
  const currentPet = petFeed[currentIndex];
  const remaining = getRemaningPets();
  const visibleCards = petFeed.slice(currentIndex, currentIndex + VISIBLE_STACK_SIZE);

  useEffect(() => {
    // reset();
    if (petFeed.length === 0) {
      fetchProfileBatch();
    };
  }, []);
  
  const onSwipeLeft = () => {
    console.log('swiping left ', currentPet.name);
    if(!currentPet) return;

    swipePass(currentPet.id);
  };

  const onSwipeRight = async () => {
    console.log('swiping right ', currentPet.name);
    if(!currentPet) return;

    const isMatch = await checkForMatch(currentPet.id);
    if(isMatch) {
      console.log('it\'s a match ');
    };

    swipeLike(currentPet.id);
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
          className="absolute top-0 left-0 right-0 bottom-8"
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
