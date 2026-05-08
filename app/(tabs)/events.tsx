import { pb } from '@/backend/config/pocketbase';
import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { EventPage } from '@/types/components';
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { getCalendars, getLocales, useLocales } from 'expo-localization';
import { router, useFocusEffect } from 'expo-router';
import { ClientResponseError } from 'pocketbase';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image as RNImage, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyEventList = [
  {
    id: '1',
    organizerId: '1',
    organizerName: 'mr small',
    eventName: 'very big event',
    date: '02-03-2050',
    synopse: 'just come',
    description: 'biggest event oat',
    address: 'green pastures',
    image: images.mrBigLike,
  }
];

const Events = () => {
  
  const userCalendars = getCalendars();
  const userTimezone = userCalendars[0].timeZone;
  const { uses24hourClock } = userCalendars[0];
  dayjs.extend(timezone);
  dayjs.extend(utc);
  
  const [isCopied, setIsCopied] = useState<{ status: boolean; id: string }>({ status: false, id: '' });
  const copyTimeoutRef = useRef<number | null>(null);

  const [eventList, setEventList] = useState<EventPage[]>([]);
  const [fetchError, setFetchError] = useState<ClientResponseError | null>();
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchEventList = async () => {
        setIsLoading(true);
        try {
          setFetchError(null);
          
          const result: EventPage[] = await pb.collection('events').getFullList({
            sort: '-created'
          });
  
          const convertedEventList = result.map((event) => (
            {
              ...event,
              image: event.image ? `${pb.baseURL}/api/files/events/${event.id}/${event.image}` : ''
            } 
          ));
  
          setEventList(convertedEventList);
  
        } catch (error) {
          if (error instanceof ClientResponseError) setFetchError(error);
          console.log('events.tsx, fetchEventList error', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEventList();
    }, [])
  );
 
  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 p-4'
    >

      <Text className='my-4 font-bold text-secondary text-center py-2 px-12 border-b border-secondary'>organazie and participate in the ongoing events to connect with the fellow pet owners in your area!</Text>

      <View className='p-2 w-52 items-center rounded-xl bg-secondary'>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/event-setup',
            // params: { initialData: 1 }
          })}
        >
          <Text className='font-bold text-primary'>register a new event (+)</Text>
        </TouchableOpacity>
      </View>

      {eventList.length !== 0 ? <Text className='mt-4 p-1 font-bold text-secondary'>active ongoing events: </Text> : null}

      <View className='items-center'>
        {isLoading && (
          <View className='absolute-center-x z-50 top-7'>
            <ActivityIndicator />
          </View>
        )}

      {(eventList.length === 0 && !isLoading) ? 
        <View className='mt-12 max-w-96'>
          <Text className="text-xl font-bold text-secondary text-center p-2">
            no events on the horizon yet! feel free to register a new one to meet new friends :)
          </Text>
        </View>
      : null}

      {(!fetchError && !isLoading)
        ? 
        <FlatList
          data={eventList}
          className='h-[75%]'
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const tz = userTimezone ?? 'UTC';
            const convertedDate = uses24hourClock
              ? dayjs.tz(item.date, tz).format('MMM DD HH:mm')
              : dayjs.tz(item.date, tz).format('MMM DD hh:mm A');

            return <TouchableOpacity
              className={`min-w-full max-w-full p-2 ${index === 0 && 'mt-2'}`}
              onPress={() => router.push({
                pathname: '/eventPages/[id]',
                params: { ...item }
              })}
            >
              <View
                className='w-full flex-row gap-3 items-center bg-primary/90 shadow shadow-secondary/40 rounded-2xl p-2 max-w-full'
              >

                <View className='size-28'>
                  <Image
                    source={item.image}
                    contentFit='cover'
                    placeholder={images.mrBigBlurhash}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  />
                </View>

                <View className='gap-2 w-48 p-1'>
                  <Text className='text-secondary font-bold'>{item.eventName}</Text>
                  <Text className=''>{item.synopse}</Text>
                  <Text className='font-light'>held by: {item.organizerName}</Text>
                  
                  <View className='items-start gap-3 p-1 max-w-44'>
                    {isCopied.status && isCopied.id === item.id && (
                      <View className='absolute -top-7 bg-secondary/60 px-2 py-1 rounded-md'>
                        <Text className='text-primary'>copied</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={async () => {
                        await Clipboard.setStringAsync(item.address);
                        setIsCopied({ status: true, id: item.id });
                        
                        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

                        copyTimeoutRef.current = setTimeout(() => {
                          setIsCopied({ status: false, id: '' });
                          copyTimeoutRef.current = null;
                        }, 2000);
                      }}
                    >
                      <RNImage
                        source={icons.copyIcon}
                        className='size-4 absolute -left-3 -top-2'
                        resizeMode='contain'
                        tintColor={Colors.secondary}
                      />
                      <Text 
                        className='font-light text-secondary text-start' 
                        lineBreakMode='tail' 
                        numberOfLines={4} 
                        >
                        <Text className='absolute-center-y -left-6'>📍</Text>
                        {item.address}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                </View>

                <Text className='text-secondary font-bold max-w-24 text-start'>{convertedDate}</Text>

              </View>
            </TouchableOpacity>
          }}
        />
        : null}

      </View>

    </SafeAreaView>
  );
};

export default Events;