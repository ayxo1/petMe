import { pb } from '@/backend/config/pocketbase';
import ProfileCard from '@/components/ProfileCard';
import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { convertPBFeedRecordToFeedProfile } from '@/stores/useFeedStore';
import { FeedProfile } from '@/types/feed';
import { PBFeedRecord } from '@/types/pbTypes';
import { assetPreloader, imagePreloader } from '@/utils/assetPreloader';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BATCH_SIZE = 20;

const Rescue = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rescueProfiles, setRescueProfiles] = useState<FeedProfile[]>([]);
  
  const [isModal, setIsModal] = useState(false);

  const VISIBLE_STACK_SIZE = 4;
  let page = 1;
  const currentProfile = rescueProfiles[currentIndex] || null;
  const visibleCards = rescueProfiles.slice(currentIndex, currentIndex + VISIBLE_STACK_SIZE);
  const remaining = rescueProfiles.length - currentIndex;

  const fetchRescueBatch = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await pb.send<{ items: PBFeedRecord[] }>("/api/rescue-feed", {
        params: {
          page: page.toString(),
          perPage: BATCH_SIZE.toString()
        }
      });
      const newProfiles = result.items.map(convertPBFeedRecordToFeedProfile);

      const uniqueNewProfiles = newProfiles.filter(newProfile => !rescueProfiles.some(existing => existing.id === newProfile.id));

      setRescueProfiles(prev => [...prev, ...uniqueNewProfiles]);

      return uniqueNewProfiles;
    } catch (error) {
      console.log('fetchRescueBatch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSwipeLeft = async () => {
    console.log('swiping left ', currentProfile.name);
    if(!currentProfile) return;

    try {

      await pb.send("/api/swipe", {
        method: "POST",
        body: {
            targetId: currentProfile.id,
            action: "pass"
        }
      });
      
    } catch (error) {
      console.log('onSwipeLeft, rescueFeed error: ', error);
    } finally {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const onSwipeRight = async () => {
    
    if(!currentProfile) return;

    try {
      const isMatch = await pb.send<{ isMatch: boolean; matchId?: string, isExisting?: boolean }>("/api/swipe", 
        {
          method: "POST",
          body: {
            targetId: currentProfile.id,
            action: "like"
          }
        }
      );
      if (isMatch.isMatch) {
        setIsModal(true);
        setRescueProfiles([]);
        await fetchRescueBatch();
      }
    } catch (error) {
      console.log('rescueFeed, onSwipeRight error:', error);
    } finally {
      setCurrentIndex(prev => prev + 1);
    }
  };

useEffect(() => {
  const init = async () => {
    try {
      const profiles = await fetchRescueBatch();
      if (profiles) {
        const firstBatch = profiles.slice(0, VISIBLE_STACK_SIZE);
        const imageUris = firstBatch.flatMap((rescueProfile) => rescueProfile.images || []).filter(Boolean);
  
        await Promise.all([
          imagePreloader(imageUris),
          assetPreloader([images.profileCardBorder])
        ]);
      }
    } catch (error) {
      console.log('rescueFeed, init error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  init();
}, []);

// useEffect(() => {
//   if (remaining < 3) fetchRescueBatch();
// }, [remaining, currentIndex, rescueProfiles]);

  return (
    <SafeAreaView
        edges={['top']}
        className='flex-1 p-2'
      >
      <View className='absolute top-20 left-6 z-50 border border-primary rounded-l-2xl rounded-r-md bg-lighterSecondary/30 shadow'>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Image
            source={icons.backIcon}
            className='size-9 shadow ml-1'
            resizeMode='contain'
            tintColor={Colors.primary}
          />
        </TouchableOpacity>
      </View>

    {isLoading && (
      <View className='absolute-center'>
        <ActivityIndicator size='large' />
      </View>
    )}

    {!isLoading && visibleCards.length === 0 && (
      <View className='absolute-center items-center'>
        <Text className="text-2xl font-bold text-gray-600">
          No more profiles currently! 🐾
        </Text>
        <Text className="text-gray-500 mt-2">
          Check back later for more pets
        </Text>
      </View>
    )}

    {visibleCards && !isLoading && (
      <>
        {visibleCards.map((profile, arrIndex) => {

          const cardIndex = currentIndex + arrIndex;
          const zIndex = visibleCards.length - arrIndex;

          return (
            <View 
              key={profile.id}
              className="absolute top-6 left-0 right-0 bottom-12 p-3 pb-4 px-5"
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
                indexes={{ index: cardIndex, reverseIndex: rescueProfiles.length - cardIndex - 1, currentIndex }}
                onSwipeLeft={arrIndex === 0 ? onSwipeLeft : undefined}
                onSwipeRight={arrIndex === 0 ? onSwipeRight : undefined}
                isPaw={true}
              />
              
            </View>
          )
        })}
      </>
    )}

    </SafeAreaView>
  );
};

export default Rescue;