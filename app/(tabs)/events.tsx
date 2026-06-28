import { pb } from '@/backend/config/pocketbase';
import Modal from '@/components/Modal';
import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { PBEventPage } from '@/types/components';
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { getCalendars } from 'expo-localization';
import { router, useFocusEffect } from 'expo-router';
import { ClientResponseError } from 'pocketbase';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Image as RNImage, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const Events = () => {
  
  const userCalendars = getCalendars();
  const userTimezone = userCalendars[0].timeZone;
  const { uses24hourClock } = userCalendars[0];
  dayjs.extend(timezone);
  dayjs.extend(utc);
  
  const [isCopied, setIsCopied] = useState<{ status: boolean; id: string }>({ status: false, id: '' });
  const copyTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const [eventList, setEventList] = useState<PBEventPage[]>([]);
  const [fetchError, setFetchError] = useState<ClientResponseError | null>();
  const [isLoading, setIsLoading] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [eventMapId, setEventMapId] = useState('');
  const selectedEvent = eventList.find(event => event.id === eventMapId);

  useFocusEffect(
    useCallback(() => {
      const fetchEventList = async () => {
        setIsLoading(true);
        try {
          setFetchError(null);
          
          const result: PBEventPage[] = await pb.collection('events').getFullList({
            sort: 'date'
          });
  
          const convertedEventList = result.map((event) => (
            {
              ...event,
              image: event.image ? `${pb.baseURL}/api/files/events/${event.id}/${event.image}` : '',
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

      {isMapOpen ? (
        <Modal
          isOpen={isMapOpen}
          toggleModal={() => {
            setIsMapOpen(false);
            setEventMapId('');
          }}
          styleProps=''
        >
            <View className='w-96 h-[90%] mt-14 border border-primary'>

              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: selectedEvent?.coordinates?.latitude || 0,
                  longitude: selectedEvent?.coordinates?.longitude || 0,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
              <Marker
                coordinate={{ 
                  latitude: selectedEvent?.coordinates?.latitude || 0,
                  longitude: selectedEvent?.coordinates?.longitude || 0,
                }}
              />
              </MapView>

              <TouchableOpacity
                onPress={() => {
                  setIsMapOpen(false);
                  setEventMapId('');
                }}
              >
                <Text className="absolute-center-x bottom-10 shadow text-primary bg-secondary/70 p-1 rounded-2xl text-l font-bold">close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="absolute top-2 left-2 z-50"
                onPress={() => {
                  setIsMapOpen(false);
                  setEventMapId('');
                }}
              >
                <Text className="bg-red-500/80 px-2 rounded-sm text-primary font-bold">x</Text>
              </TouchableOpacity>

            </View>
        </Modal>
    ) : null}

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
          className='h-[72%]'
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            // const tz = userTimezone ?? 'UTC';
            const convertedDate = uses24hourClock
              ? dayjs(item.date).format('MMM DD HH:mm')
              : dayjs(item.date).format('MMM DD hh:mm A');

            return <TouchableOpacity
              className={`min-w-full max-w-full p-2 ${index === 0 && 'mt-2'}`}
              onPress={() => router.push({
                pathname: '/eventPages/[id]',
                params: { 
                  id: item.id,
                  eventName: item.eventName,
                  organizerId: item.organizerId,
                  organizerName: item.organizerName,
                  description: item.description,
                  synopse: item.synopse,
                  address: item.address,
                  coordinates: JSON.stringify(item.coordinates),
                  image: item.image,
                  date: convertedDate,
                  allowMessaging: item.allowMessaging ? 1 : 0
                }
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

                <View className='gap-3 w-48 p-1'>
                  <Text className='text-secondary font-bold text-lg text-center'>{item.eventName}</Text>
                  <Text className=''>{item.synopse}</Text>
                  <Text className='font-light'>held by: {item.organizerName}</Text>
                  
                  <View className='items-start gap-3 p-1 max-w-44'>
                    {isCopied.status && isCopied.id === item.id && (
                      <View className='absolute -top-7 bg-secondary/60 px-2 py-1 rounded-md'>
                        <Text className='text-primary'>copied</Text>
                      </View>
                    )}

                    <View
                      className='flex-row gap-2'
                    >
                      <RNImage
                        source={icons.copyIcon}
                        className='size-4 absolute -left-3 -top-2'
                        resizeMode='contain'
                        tintColor={Colors.secondary}
                      />
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
                      <Text 
                        className='font-light text-secondary text-start' 
                        lineBreakMode='tail'
                        numberOfLines={4} 
                        >
                        <Text className='absolute-center-y -left-6'>📍</Text>
                        {item.address}
                      </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => {
                          setEventMapId(item.id);
                          setIsMapOpen(true);
                        }}
                      >
                        <Text className='text-primary font-bold bg-secondary p-2 rounded-2xl'>open map</Text>
                      </TouchableOpacity>

                    </View>
                  </View>

                  
                </View>

                <Text className='text-secondary font-bold w-20 text-start mb-20'>{convertedDate}</Text>

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