import { pb } from '@/backend/config/pocketbase';
import CommentSection from '@/components/CommentSection';
import Modal from '@/components/Modal';
import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { Comment, EventPageParams } from '@/types/components';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import MapView, { Marker } from 'react-native-maps';
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
  const params = useLocalSearchParams<EventPageParams>();
  const { id, organizerId, eventName, organizerName, image, description, address, date, coordinates } = params;

  const allowMessaging = params.allowMessaging === '1';
  const eventCoords = coordinates ? JSON.parse(coordinates) : null;
  
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null | undefined>();

  const [isCopied, setIsCopied] = useState<{ status: boolean }>({ status: false });
  const copyTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);

  const connectOrganizer = async () => {
    try {
      const result = await pb.send<{ matchId: string; isExisting: boolean }>('/api/profile-connect', {
        method: 'POST',
        body: { profileOwnerId: organizerId }
      });

      router.push({
        pathname: '/chat/[id]',
        params: { 
          id: result.matchId,
          otherUserName: organizerName,
          otherUserImage: image,
          otherUserId: organizerId,
          otherUserType: 'seeker'
        }
      });

    } catch (error) {
      console.log('connectOrganizer error, eventPages/[id].tsx: ', error);
      Alert.alert('an error occurred while trying to message, please try again');
    }
  };


  useEffect(() => {
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const PBComments: Comment[] = await pb.collection('comments').getFullList({
          filter: `eventId = "${id}"`,
          sort: '-created'
        });
        setComments(PBComments);
      } catch (error) {
        console.log('eventPages/[id].tsx fetchComments error:', error);
        
      } finally {
        setIsLoadingComments(false);
      }
    };
    fetchComments();
  }, []);

  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 p-2 items-center'
    >
      <BackIcon />

      {isMapOpen && eventCoords ? (
        <Modal
          isOpen={isMapOpen}
          toggleModal={setIsMapOpen}
          styleProps=''
        >
          <View className='w-96 h-[90%] mt-14 border border-primary'>

            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: eventCoords.latitude,
                longitude: eventCoords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
            <Marker
              coordinate={{ 
                latitude: eventCoords.latitude,
                longitude: eventCoords.longitude,
              }}
            />
            </MapView>

            <TouchableOpacity
              onPress={() => setIsMapOpen(false)}
            >
              <Text className="absolute-center-x bottom-10 shadow text-primary bg-secondary/70 p-1 rounded-2xl text-l font-bold">close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="absolute top-2 left-2 z-50"
              onPress={() => setIsMapOpen(false)}
            >
              <Text className="bg-red-500/80 px-2 rounded-sm text-primary font-bold">x</Text>
            </TouchableOpacity>

          </View>
        </Modal>
    ) : null}

      <View>

        <View 
          className='min-w-full bg-primary shadow shadow-secondary/10 rounded-2xl p-2 mt-4 mb-2 gap-2 items-center'
        >
          <View className='size-28 items-center justify-center'>
            <Image
              source={image}
              contentFit='cover'
              style={{ width: '100%', height: '100%', borderRadius: 10 }}
              placeholder={images.mrBigBlurhash}
            />
            
            {(organizerId !== user?.id && allowMessaging) ? (
              <TouchableOpacity 
                className='absolute self-center left-40 border border-green-700 rounded-2xl max-w-24 items-center'
                onPress={connectOrganizer}
              >
                <Text className='p-2 text-green-700 text-center'>message organizer</Text>
              </TouchableOpacity>
            ) : null}

            <View 
              className='absolute self-center right-40 rounded-2xl max-w-24 items-center border border-secondary/10'
            >
              <Text className='p-2 text-secondary text-center font-bold text-xl'>{date}</Text>
            </View>

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

          <View className='gap-4 min-w-full'>

            <Text className='text-secondary font-bold'>
              info: <Text className='font-light text-black/80'>{description}</Text>
            </Text>

            
            <Text className='text-secondary font-bold'>
              held by: <Text className='font-light text-black/80'>{organizerName}</Text>
            </Text>
            
            <View>
              {isCopied.status && (
                <View className='absolute -top-7 bg-secondary/60 px-2 py-1 rounded-md'>
                  <Text className='text-primary'>copied</Text>
                </View>
              )}

              <View className='flex-row w-[75%] gap-2'>
                <TouchableOpacity
                  onPress={async () => {
                    await Clipboard.setStringAsync(address);
                    setIsCopied({ status: true });
                    
                    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

                    copyTimeoutRef.current = setTimeout(() => {
                      setIsCopied({ status: false });
                      copyTimeoutRef.current = null;
                    }, 2000);
                  }}
                >
                  <Text className='text-secondary font-bold'>address:
                    <Text className='font-light text-black/80'> {address}</Text>
                  </Text>
                  
                </TouchableOpacity>
                <TouchableOpacity
                  className='bg-secondary p-2 rounded-2xl'
                  onPress={() => setIsMapOpen(true)}
                >
                  <Text className='text-primary font-bold'>open map</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>

        <KeyboardProvider>
          <CommentSection
            comments={comments}
            setComments={setComments}
            isLoadingComments={isLoadingComments}
            eventId={id}
          />
        </KeyboardProvider>
      </View>
        
    </SafeAreaView>
  );
};

export default EventPage;