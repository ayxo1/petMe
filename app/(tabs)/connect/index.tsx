import { swipesAPI } from '@/backend/config/pocketbase';
import ChatRow from '@/components/ChatRow';
import { useAuthStore } from '@/stores/authStore';
import { MatchRowData } from '@/types/components';
import { PBPet, PBUser } from '@/types/pbTypes';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';


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