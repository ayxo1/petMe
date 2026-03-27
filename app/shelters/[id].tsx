import { icons, images } from '@/constants';
import Colors from '@/constants/Colors';
import { PetProfile } from '@/types/pets';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyPetList = [
  {
    id: '123421',
    image: images.ket,
    name: 'some shelter',
    bio: 'some random words',
  },
  {
    id: '1234',
    image: images.ket,
    name: 'some shelter 2',
    bio: 'yada yada words',
  },
  {
    id: '123333',
    image: images.ket,
    name: 'some shelter 3',
    bio: 'hmm very many words here hmm very many words here hmm very many words here',
  },
];

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
 
const ShelterPage = () => {
  const params = useLocalSearchParams();
  const { id, image, orgName, description, address } = params;

  const [selectedPetProfile, setSelectedPetProfile] = useState<PetProfile | null>();

  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 p-2 items-center'
    >
      <BackIcon />

      <ScrollView
        contentContainerStyle={
          { alignItems: 'center' }
        }
      >

        <View 
          className='bg-primary shadow shadow-secondary/10 rounded-2xl p-4 m-6 w-96 gap-4 items-center'
        >
          <View className='size-28 items-center justify-center'>
            <Image
              source={images.ket}
              contentFit='cover'
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
            />
          </View>

          <Text className='text-secondary font-bold text-center'>{orgName}</Text>

          <View className='items-start gap-3'>
            <Text className='text-secondary font-bold'>info: {description}</Text>
            <Text className='text-secondary font-bold'>address: {address}</Text>
          </View>
        </View>


        <View className='items-center w-full'>
          {/* <FlatList
          data={dummyPetList}
          renderItem={({ item }) => (
              <TouchableOpacity
              className='min-w-full max-w-full p-2'
              >
              <View
                  className='w-full flex-row gap-4 items-center bg-primary/90 shadow shadow-secondary/20 rounded-2xl p-1 border border-lighterSecondary/40'
              >

                  <View className='size-24'>
                      <Image
                          source={item.image}
                          contentFit='cover'
                          placeholder={images.mrBigBlurhash}
                          style={{ width: '100%', height: '100%', borderRadius: 16 }}
                      />
                  </View>

                  <View className='gap-2 w-44'>
                      <Text className='text-secondary font-bold'>{item.name}</Text>
                      <Text className='font-light'>{item.bio}</Text>
                  </View>

                  <View className='items-center gap-2 max-w-24'>
                      <TouchableOpacity className='items-center'>
                          <Text className='font-light text-secondary text-center'>open map</Text>
                      </TouchableOpacity>
                  </View>

              </View>
              </TouchableOpacity>
          )}
          /> */}
          {dummyPetList.map(item => (
            <TouchableOpacity
              className='w-full p-2'
              key={item.id}
            >
              <View
                className='w-full flex-row gap-4 items-center bg-primary/90 shadow shadow-secondary/20 rounded-2xl p-1 border border-lighterSecondary/40'
              >

                <View className='size-24'>
                  <Image
                    source={item.image}
                    contentFit='cover'
                    placeholder={images.mrBigBlurhash}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  />
                </View>

                <View className='gap-2 w-44'>
                  <Text className='text-secondary font-bold'>{item.name}</Text>
                  <Text className='font-light'>{item.bio}</Text>
                </View>

                <View className='items-center gap-2 max-w-24'>
                  <TouchableOpacity className='items-center'>
                      <Text className='font-light text-secondary text-center'>open map</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
        
    </SafeAreaView>
  );
};

export default ShelterPage;