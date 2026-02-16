import { pb } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { useChatStore } from '@/stores/useChatStore';
import { MatchRowData } from '@/types/components';
import { Link } from 'expo-router';
import { Image, ImageSourcePropType, Text, TouchableHighlight, View } from 'react-native';

const ChatRow = ({ matchId, matchedUser, petName, lastMessage }: MatchRowData) => {  
  
  const profilePic: ImageSourcePropType = { uri: `${pb.baseURL}/api/files/users/${matchedUser.id}/${matchedUser.images[0]}`};
    console.log(profilePic.uri);

  const unreadChatRooms = useChatStore(state => state.unreadChatRooms);
  const isChatRead = unreadChatRooms.includes(matchId);
    
  return (
    <Link href={{
        pathname: '/chat/[id]',
        params: {
          id: matchId,
          otherUserName: matchedUser.username,
          otherUserImage: profilePic.uri,
          otherUserId: matchedUser.id,
          otherUserType: matchedUser.accountType
        }
      }} asChild
    >
      <TouchableHighlight underlayColor={Colors.secondary}>
        <View className='flex-row items-center p-2'>
          <Image
            source={profilePic}
            className={`w-16 h-16 rounded-full ${(isChatRead || !lastMessage) && 'border border-red-500/60'}`}
          />
          {(isChatRead || !lastMessage) && (
            <View className='absolute left-14 top-2'>
              <Text>🔴</Text>
            </View>
          )}
          <View className='flex-1 ml-5'>
            <View className='flex-row items-center gap-2'>
              <Text className='text-xl'>
                {matchedUser.username}
              </Text>
              <Text className='text-base text-secondary'>
                {(petName === 'seeker' || petName === 'owner') ? `(${petName})` : `(${petName}'s owner)`}
              </Text>
            </View>
            <Text
              className={`text-base ${(isChatRead || !lastMessage) ? 'text-red-500' : 'text-secondary'}`}
              numberOfLines={2}>
                {lastMessage || 'start chatting!'}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    </Link>
  )
};

export default ChatRow;