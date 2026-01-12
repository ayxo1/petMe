import { swipesAPI } from '@/backend/config/pocketbase';
import ChatRow from '@/components/ChatRow';
import { useAuthStore } from '@/stores/authStore';
import { MatchRowData } from '@/types/components';
import { PBPet, PBUser } from '@/types/pbTypes';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  
  const userId = useAuthStore(state => state.user?.id) || '';

  const [matchRows, setMatchRows] = useState<MatchRowData[]>();
  
  useFocusEffect(
    useCallback(() => {
      const getMatchRowsData = async () => {
        const matchData = await swipesAPI.getUserMatches(userId);
  
        const rows = matchData.map(match => {
          const isUser1Me = match.user1 === userId;
          const matchedUser: PBUser = isUser1Me ? match.expand?.user2 : match.expand?.user1;
  
          const targetPet: PBPet = isUser1Me ? match.expand?.pet2 : match.expand?.pet1;
          const displayPetName: string = targetPet?.name || 'seeker';
  
          return {
            matchId: match.id,
            matchedUser,
            petName: displayPetName
          };
          
        });
        setMatchRows(rows);
      };
  
      getMatchRowsData();
    }, [])
  )

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      contentContainerStyle={{ paddingBottom: 40 }}
    > 
      {matchRows?.length === 0 && (
        <SafeAreaView className="flex-1 p-6 items-center mt-10 justify-center">
          <Text className="text-2xl font-bold text-gray-600 text-center max-w-96">
            Swipe on profiles to connect with more pets!
            {"\n"}
            {"\n"}
            You will be able to talk to their owners on this page 🐾
          </Text>
        </SafeAreaView>
      )}
      <FlatList 
        scrollEnabled={false}
        data={matchRows}
        // ItemSeparatorComponent={() => <View className='h-1 bg-secondary rounded-full'></View>}
        keyExtractor={(item) => item.matchId}
        renderItem={({item}) => <ChatRow {...item}/>}
      />
    </ScrollView>
  )
}

export default Index;