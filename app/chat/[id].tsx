import { messagesAPI } from '@/backend/config/pocketbase';
import Modal from '@/components/Modal';
import ReportForm from '@/components/ReportForm';
import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/useChatStore';
import { PBMessage } from '@/types/pbTypes';
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatPage = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const [isModal, toggleIsModal] = useState(false);
  
  const insets = useSafeAreaInsets();
  const tabbarHeight = 14;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset = insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  const params = useLocalSearchParams<{ id: string; otherUserName: string; otherUserImage: string; otherUserId: string; }>();
  const { id: matchId, otherUserName, otherUserImage, otherUserId } = params;

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
  
  const userId = useAuthStore(state => state.user?.id);
  if (!userId) return; 

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
          (incMsg) => {
            setMessages(prev => {
              if (prev.some(msg => msg._id === incMsg._id)) {
                return prev;
              }
              return GiftedChat.append(prev, [incMsg]);
            });
          });

          await messagesAPI.markMessagesAsRead(matchId, userId);

          checkUnreadStatus(userId);
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
          // setMessages(previousMessages =>
          //   GiftedChat.append(previousMessages, messages),
          // );
        }
      };
      sendMessage();
    } catch (error) {
      Alert.alert('error', 'error occurred sending the message, please try again');
      console.log('sendMessage error:', error);
    }
  }, []);

  return (
    <View className={`flex-1 mb-6`}>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <View className='flex-row items-center gap-2 pb-2'>
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
            </View>
          ),
          headerLeft: () => (
            <View className="flex-row gap-5">
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
                {/* <View className='justify-center'>
                    <TouchableOpacity
                        onPress={unmatch}
                        >
                        <Text>unmatch</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        ),
        headerRight: () => (
          <View className="flex-row gap-2">
              <TouchableOpacity
                  onPress={() => toggleIsModal(!isModal)}
              >
                  <Modal
                      isOpen={isModal} 
                      toggleModal={toggleIsModal}
                      styleProps='px-4 bg-white/80'
                  >
                      <ReportForm
                        toggleModal={toggleIsModal}
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
      <GiftedChat
        user={{ _id: userId }}
        messages={messages}
        textInputProps={{
          style: { color: Colors.secondary }
        }}
        onSend={(messages: any) => onSend(messages)}
        scrollToBottomOffset={insets.bottom}
        renderAvatar={null}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} 
          containerStyle={{
            backgroundColor: 'fffff',
            paddingHorizontal: 10,
            borderRadius: 20,
            borderTopColor: Colors.secondary,
          }}
          />
        )}
        renderBubble={(props) => (
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
        )}

        keyboardAvoidingViewProps={{ keyboardVerticalOffset, enabled: !isModal }}
      />
    </View>
  )
};

export default ChatPage;