import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BackIcon = () => {
  return (
    <View className='absolute top-16 left-6 z-50'>
      <TouchableOpacity
        onPress={() => router.back()}
      >
      <RNImage
        source={icons.backIcon}
        className='size-9'
        resizeMode='contain'
        tintColor={Colors.secondary}
      />
      </TouchableOpacity>
    </View>
  );
};
 
const EventPage = () => {
  const user = useAuthStore(state => state.user);
  const params = useLocalSearchParams();
  const { id, organizerId, eventName, organizerName, image, synopse, description, address, date } = params;

  const [comments, setComments] = useState<string[] | null>();

  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 p-2 items-center'
    >
      <BackIcon />

      {/* {isLoading && (
        <ActivityIndicator 
          className='absolute-center'
        />
      )} */}

      <ScrollView
        contentContainerStyle={
          { alignItems: 'center' }
        }
      >

        <View 
          className='bg-primary shadow shadow-secondary/10 rounded-2xl p-4 m-6 w-96 gap-2 items-center'
        >
          <View className='size-36 items-center justify-center'>
            <Image
              source={image ? image : images.mrBigBlurhash}
              contentFit='cover'
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
            />

            {organizerId !== user?.id ? (
              <TouchableOpacity 
                className='absolute self-center left-40 border border-green-700 rounded-2xl max-w-24 items-center'
                // onPress={connectShelter}
              >
                <Text className='p-2 text-green-700 text-center'>message organizer</Text>
              </TouchableOpacity>
            ) : null}

            {organizerId === user?.id ? (
              <TouchableOpacity 
                className='absolute self-center left-40 border border-secondary rounded-2xl max-w-24 items-center'
                onPress={() => router.push({
                  pathname: '/event-setup',
                  params: { id, initialData: 1 }
                })}
              >
                <Text className='p-2 text-secondary text-center'>edit event</Text>
              </TouchableOpacity>
            ) : null}

          </View>


          <Text className='text-secondary font-bold text-center mb-2'>{eventName} {organizerId === user?.id ? <Text className='text-authPrimary font-normal'>(your event)</Text> : null}</Text>

          <View className='items-start gap-4'>
            <Text className='text-secondary font-bold'>
              info: <Text className='font-light text-black/80'>{description}</Text>
            </Text>
            <Text className='text-secondary font-bold'>
              address: <Text className='font-light text-black/80'>{address}</Text>
            </Text>
          </View>
        </View>

        <Text className='text-secondary font-bold border border-secondary rounded-2xl py-1 px-2'>add a comment (+)</Text>

        <View className='bg-primary shadow shadow-secondary/10 rounded-2xl p-4 m-6 w-96 gap-2'>
            <View className='items-center'>
              {!comments ? <Text className='font-light text-gray-500'>be first to add a comment!</Text> : null}
            </View>
            <View className='items-start my-2 border border-lighterSecondary p-2 rounded-2xl gap-1'>
              <View className='flex-row max-w-60'>
                <Text className='label'>someone</Text>
                <Text>a comment</Text>
              </View>
              <TouchableOpacity>
                <Text className='font-light text-gray-500'>reply</Text>
              </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
        
    </SafeAreaView>
  );
};

export default EventPage;