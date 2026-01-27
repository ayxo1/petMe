import Modal from '@/components/Modal';
import ProfileCard from '@/components/ProfileCard';
import ProfileInterface from '@/components/ProfileInterface';
import { icons, images } from "@/constants";
import Colors from '@/constants/Colors';
import { useLikesStore } from '@/stores/useLikesStore';
import { FeedProfile, IncomingLikeFeedProfile } from '@/types/feed';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Image, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width / 2) - 24;

const Likes = () => {

  const { fetchIncomingLikesProfiles, incomingLikes } = useLikesStore();
  const [isModal, toggleIsModal] = useState(false);

  const [ selectedProfile, setSelectedProfile ] = useState<IncomingLikeFeedProfile | null>();
  

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        
        try {
          if (incomingLikes.length === 0) {
            await fetchIncomingLikesProfiles();
            console.log('usecallback log: ',incomingLikes);
          }

          
        } catch (error) {
          console.log('error fetching incomingLikes: ', error);
          
        }
      }
      init();
      console.log('inc likes:', incomingLikes);
      
    }, [])
  )

  return (
    <SafeAreaView
      edges={['top']}
    >
      <Modal 
        isOpen={!!selectedProfile}
        toggleModal={() => setSelectedProfile(null)}
        styleProps='bg-transparent border'
      >
        {selectedProfile && (
          <View
            className='w-full rounded-3xl'
          >
            <ProfileCard 
              profileImages={selectedProfile.images}
              profileName={selectedProfile.name}
              profileDescription={selectedProfile.bio}
              indexes={{index: 0, reverseIndex: 0, currentIndex: 0}}
              />
          </View>
        )}
      </Modal>

      <FlatList
        data={incomingLikes}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableHighlight 
            underlayColor={`${Colors.authPrimary}`}
            onPress={() => setSelectedProfile(item)}
            style={{ width: ITEM_WIDTH }}
            className=''
          >
            <View className='justify-center items-center p-2'>
              <Image
                source={{uri: item.images[0]}}
                className='w-16 h-16 rounded-full border border-secondary/40'
              />
              <Text
                className='absolute top-2 right-8 border border-secondary/20 rounded-xl px-1 bg-authPrimary/40'
              >{item.type}</Text>
              <View className='items-center'>
                <View className='flex-row items-center gap-2'>
                  <Text className='text-xl'>
                    {item.name}
                  </Text>
                </View>
                <Text className='text-base text-secondary' numberOfLines={2}>liked {item.likedTargetName}</Text>
              </View>
            </View>
          </TouchableHighlight>
        )}
      />
    </SafeAreaView>
  )
}

export default Likes;