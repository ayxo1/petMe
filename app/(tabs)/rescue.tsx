import { pb } from '@/backend/config/pocketbase';
import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { convertPBShelterToShelterProfile } from '@/stores/shelterStore';
import { ShelterProfile } from '@/types/auth';
import { PBShelterProfile } from '@/types/pbTypes';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image as RNImage, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Rescue = () => {
  const [isCopied, setIsCopied] = useState<{ status: boolean; id: string }>({ status: false, id: '' });
  const copyTimeoutRef = useRef<number | null>(null);

  const [shelterList, setShelterList] = useState<ShelterProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchShelterProfiles = async () => {
      try {
        setIsLoading(true);
        const pbShelters: PBShelterProfile[] = await pb.collection('shelters').getFullList({
          sort: '-created'
        });
        const convertedShelters = pbShelters.map(convertPBShelterToShelterProfile)
        setShelterList(convertedShelters);
      } catch (error) {
        console.log('fetchShelterProfiles error, rescue.tsx: ', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShelterProfiles();
  }, []);

  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 p-4'
    >
      <TouchableOpacity 
        className='flex-row justify-center items-center bg-authPrimary/80 shadow shadow-secondary/50 rounded-2xl py-4'
        onPress={() => router.push('/rescueFeed')}
      >
        <Text className='text-primary font-bold'>Browse pets that are looking for a new home</Text>
        <RNImage
          source={icons.backIcon}
          className='size-6 transform rotate-180'
          resizeMode='contain'
          tintColor={Colors.primary}
        />
      </TouchableOpacity>

      <Text className='mt-4 p-1 font-bold text-secondary'>Browse shelter pets: </Text>

      
      <View className='items-center'>
        {isLoading && (
          <ActivityIndicator
            className='absolute-center'
          />
        )}

        <FlatList 
          data={shelterList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              className={`min-w-full max-w-full p-2 ${index === 0 && 'mt-2'}`}
              onPress={() => router.push({
                pathname: '/shelters/[id]',
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

                <View className='gap-2 w-44 p-1'>
                  <Text className='text-secondary font-bold'>{item.name}</Text>
                  <Text className='font-light'>{item.description}</Text>
                </View>

                <View className='items-center gap-3 max-w-24 p-1'>
                  {isCopied.status && isCopied.id === item.id && (
                    <View className='absolute -left-10 -top-5 bg-secondary/60 px-2 py-1 rounded-md'>
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
                      className='size-4 absolute -left-5 -top-1'
                      resizeMode='contain'
                      tintColor={Colors.secondary}
                    />
                    <Text className='absolute-center-y -left-6'>📍</Text>
                    <Text 
                      className='font-light text-secondary text-start' 
                      lineBreakMode='tail' 
                      numberOfLines={4} 
                      >
                      {item.address}
                    </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity 
                    className='items-center gap-1'
                    onPress={() => Linking.openURL('https://maps.app.goo.gl/UH3u1v1PUHS3wCs4A')}
                  >
                    <RNImage 
                      source={icons.googleMap}
                      className='size-9'
                      resizeMode='contain'
                    />
                    <Text className='font-light text-secondary text-center'>open map</Text>
                  </TouchableOpacity> */}
                </View>

              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Rescue;