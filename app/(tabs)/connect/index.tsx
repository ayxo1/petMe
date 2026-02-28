import { swipesAPI } from '@/backend/config/pocketbase';
import ChatRow from '@/components/ChatRow';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/useChatStore';
import { MatchRowData } from '@/types/components';
import { PBPet, PBUser } from '@/types/pbTypes';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  
  const user = useAuthStore(state => state.user);
  const userId = user?.id || '';

  const checkUnreadChatRooms = useChatStore(state => state.checkUnreadChatRooms);
  
  const [matchRows, setMatchRows] = useState<MatchRowData[]>();
  const [isLoading, setIsLoading] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      checkUnreadChatRooms(userId);
      
      const getMatchRowsData = async () => {
        const matchData = await swipesAPI.getUserMatches(userId);
  
        const rows = matchData.map(match => {
          const isUser1Me = match.user1 === userId;
          const matchedUser: PBUser = isUser1Me ? match.expand?.user2 : match.expand?.user1;
  
          const targetPet: PBPet = isUser1Me ? match.expand?.pet2 : match.expand?.pet1;
          const displayPetName: string = targetPet?.name || matchedUser.accountType;
  
          return {
            matchId: match.id,
            matchedUser,
            petName: displayPetName,
            lastMessage: match.lastMessage,
            lastMessageTime: match.lastMessageTime
          };
          
        });
        setMatchRows(rows);
        setIsLoading(false);
      };
  
      getMatchRowsData();
    }, [])
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      contentContainerStyle={{ paddingBottom: 40 }}
    > 
      {matchRows?.length === 0 && (
        <SafeAreaView className="flex-1 p-2 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-600 text-center max-w-96">
            {user?.accountType === 'owner' 
              ? 'Swipe on profiles to connect with more pets and seekers!' 
              : 'Swipe on profiles to connect with more pets!'
            }
            {"\n"}
            {"\n"}
            You will be able to chat with them on this page
          </Text>
        </SafeAreaView>
      )}
      {isLoading && (
        <SafeAreaView className="flex-1 flex-row gap-2 items-center justify-center absolute top-48 left-0 right-0">
          <ActivityIndicator size="small" className='color-gray-600/60' />
          <Text className="text-2xl text-gray-600/60 text-center max-w-96">loading</Text>
        </SafeAreaView>
      )}
      <FlatList 
        scrollEnabled={false}
        data={matchRows}
        keyExtractor={(item) => item.matchId}
        renderItem={({item}) => <ChatRow {...item}/>}
      />
    </ScrollView>
  )
}

export default Index;