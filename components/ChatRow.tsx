import { pb } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { MatchRowData } from '@/types/components';
import { Link } from 'expo-router';
import { Image, ImageSourcePropType, Text, TouchableHighlight, View } from 'react-native';

const ChatRow = ({ matchId, matchedUser, petName }: MatchRowData) => {  
  
  const profilePic: ImageSourcePropType = { uri: `${pb.baseURL}/api/files/users/${matchedUser.id}/${matchedUser.images}`};
  
  return (
    <Link href={'/'} asChild>
      <TouchableHighlight underlayColor={Colors.secondary}>
        <View className='flex-row items-center p-2'>
          <Image
            source={profilePic}
            className='w-16 h-16 rounded-full'
          />
          <View className='flex-1 ml-5'>
            <View className='flex-row items-center gap-2'>
              <Text className='text-xl'>
                {matchedUser.username}
              </Text>
              <Text className='text-base text-slate-500'>
                {petName!=='seeker' ? `(${petName}'s owner)` : '(seeker)'}
              </Text>
            </View>
            <Text className='text-base text-slate-400' numberOfLines={2}>text msg</Text>
          </View>
        </View>
      </TouchableHighlight>
    </Link>
  )
};

export default ChatRow;