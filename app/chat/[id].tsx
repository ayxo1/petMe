import { messagesAPI } from '@/backend/config/pocketbase';
import Modal from '@/components/Modal';
import ProfileInterface from '@/components/ProfileInterface';
import ReportForm from '@/components/ReportForm';
import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { convertPBUserToUser, useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/useChatStore';
import { User } from '@/types/auth';
import { PBMessage, PBUser } from '@/types/pbTypes';
import { PetProfile } from '@/types/pets';
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, BubbleProps, GiftedChat, IMessage, InputToolbar, InputToolbarProps } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const renderInputToolbar = (props: InputToolbarProps<IMessage>) => (
  <InputToolbar {...props} 
  containerStyle={{
    backgroundColor: 'fffff',
    paddingHorizontal: 10,
    borderRadius: 20,
    borderTopColor: Colors.secondary,
  }}
  />
);

const renderBubble = (props: BubbleProps<IMessage>) => (
  <Bubble {...props} 
    textStyle={{
      left: {
        fontSize: 16,
        color: '#000000'
      },
      right: {
        fontSize: 16,
        color: '#000000'
      }
    }}
    wrapperStyle={{
      left: {
        backgroundColor: Colors.secondary
      },
    }}
  />
);

const ChatPage = () => {
  const userId = useAuthStore(state => state.user?.id);
  if (!userId) return; 

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [isReportModal, toggleIsReportModal] = useState(false);
  const [matchProfileModal, toggleMatchProfileModal] = useState(false);

  const [matchData, setMatchData] = useState<User>();
  const [selectedPets, setSelectedPets] = useState<PetProfile[]>();

  const params = useLocalSearchParams<{ id: string; otherUserName: string; otherUserImage: string; otherUserId: string; otherUserType: string }>();
  const { id: matchId, otherUserName, otherUserImage, otherUserId, otherUserType } = params;
  
  const insets = useSafeAreaInsets();
  const tabbarHeight = 14;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset = insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  const { checkUnreadStatus } = useChatStore();

  const unmatch = async () => {
    try {
      await messagesAPI.unmatchProfile(matchId);
      router.push('/(tabs)/connect');
    } catch (error) {
      console.log('unmatch error: ', error);
      Alert.alert('error occurred while unmatching, please try again');
    }
  }
  

  useEffect(() => {
    const formatChatMessages = (messages: PBMessage[]): IMessage[] => {
      const formattedChatMessages = messages.map(message => {
        return {
          _id: message.id,
          text: message.content,
          createdAt: new Date(message.created),
          user: {
            _id: message.sender,
            // name: 'John Doe',
            // avatar: 'https://placeimg.com/140/140/any',
          },
        }
      });

      return formattedChatMessages;
    };

    const retrieveChatMessages = async () => {
      try {
        const chatMessages: PBMessage[] = await messagesAPI.getMessages(matchId);

        const formattedChatMessages: IMessage[] = formatChatMessages(chatMessages);
  
        setMessages(formattedChatMessages);

        // check and handle unread messages status
        await messagesAPI.markMessagesAsRead(matchId, userId);
        checkUnreadStatus(userId);
        
      } catch (error) {
        console.log('retrieveChatMessages error:', error);
      }

    };

    retrieveChatMessages();

    let unsubscribe: () => void;

    const trackMessages = async () => {
      try {
        unsubscribe = await messagesAPI.subscribe(
          matchId, 
          userId, 
          async (incMsg) => {
            setMessages(prev => {
              if (prev.some(msg => msg._id === incMsg._id)) {
                return prev;
              }
              return GiftedChat.append(prev, [incMsg]);
            });
            if (incMsg._id !== userId) {
              await messagesAPI.markMessagesAsRead(matchId, userId);
              checkUnreadStatus(userId);
            }
          });
          
      } catch (error) {
        console.log('trackMessages error:', error);
      }
    };

    trackMessages();

    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [matchId]);

  const onSend = useCallback((messages: IMessage[] = []) => {
    try {
      const sendMessage = async () => {
        if (!messages.length) return;

        if (messages) {
          console.log(messages[0]);

          await messagesAPI.sendMessage(matchId, userId, messages[0].text);
        }
      };
      sendMessage();
    } catch (error) {
      Alert.alert('error', 'error occurred sending the message, please try again');
      console.log('sendMessage error:', error);
    }
  }, []);
console.log(matchData?.images);

  return (
    <View className={`flex-1 mb-6`}>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <TouchableOpacity 
              className='flex-row items-center gap-2 pb-2'
              onPress={async () => {
                if(!matchProfileModal) {
                  try {
                    const PBuser = await messagesAPI.getUser(otherUserId);
                    const convertedUser = convertPBUserToUser(PBuser)
                    setMatchData(convertedUser);
                  } catch (error) {
                    console.log('getUser, [id].tsx error:', error);
                  }
                }
                toggleMatchProfileModal(!matchProfileModal);
              }}
            >
              <Image
                source={{ uri: otherUserImage }}
                style={{ 
                  width: 40,
                  height: 40,
                  borderRadius: 20
                }}
              />
              <Text className='text-xl font-bold text-primary'>
                {otherUserName}
              </Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <View className="flex-row gap-2 items-center">
              <View>
                <TouchableOpacity
                  onPress={() => router.back()}
                >
                  <Image
                    source={icons.backIcon}
                    className='size-9'
                    resizeMode='contain'
                    tintColor={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
              {otherUserType === 'owner' && (
                <TouchableOpacity>
                  <Text className='text-primary border border-primary p-1 rounded-xl'>see pets</Text>
                </TouchableOpacity>
              )}
            </View>
        ),
        headerRight: () => (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => toggleIsReportModal(!isReportModal)}
            >
              <Modal
                isOpen={isReportModal} 
                toggleModal={toggleIsReportModal}
                styleProps='px-4 bg-white/80'
              >
                <ReportForm
                  toggleModal={toggleIsReportModal}
                  userId={userId}
                  reportedProfileName={otherUserName}
                  reportedProfileId={otherUserId}
                />
                <View className='justify-center'>
                  <TouchableOpacity
                    className='custom-btn bg-red-900 mb-10 py-1.5'
                    onPress={unmatch}
                  >
                    <Text className='text-white'>unmatch</Text>
                  </TouchableOpacity>
                </View>
              </Modal> 
              <Text className="text-red-900">report</Text>
            </TouchableOpacity>
          </View>
        ),
        }}
      />
      {matchProfileModal && (
        <TouchableOpacity
          onPress={() => toggleMatchProfileModal(!matchProfileModal)}
        >
          <Modal
            isOpen={matchProfileModal} 
            toggleModal={toggleMatchProfileModal}
            styleProps={`${matchData ? 'bg-transparent px-6' : 'px-4 bg-white/80'}`}
          >
            {matchData && (
              <View className='w-full aspect-[0.55]'>
                <ProfileInterface 
                  profileImages={matchData.images}
                  profileName={matchData.username}
                  profileDescription={matchData.bio}
                />
              </View>
            )}
            {!matchData && (
              <View className='items-center py-10 px-5'>
                <Text className='text-xl font-bold text-red-400'>error retrieving profile</Text>
              </View>
              )}
          </Modal>
      </TouchableOpacity>
      )}
      <GiftedChat
        user={{ _id: userId }}
        messages={messages}
        textInputProps={{
          style: { color: Colors.secondary }
        }}
        onSend={(messages: any) => onSend(messages)}
        scrollToBottomOffset={insets.bottom}
        renderAvatar={null}
        renderInputToolbar={renderInputToolbar}
        renderBubble={renderBubble}

        keyboardAvoidingViewProps={{ keyboardVerticalOffset, enabled: !isReportModal }}
      />
    </View>
  )
};

export default ChatPage;