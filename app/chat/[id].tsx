import { messagesAPI } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Bubble, Composer, GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatPage = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  
  const insets = useSafeAreaInsets();
  const tabbarHeight = 14;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset = insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  const params = useLocalSearchParams();
  const { id: matchId } = params;
  const userId = useAuthStore(state => state.user?.id);
  if (!userId) return; 

  useEffect(() => {
    const retrieveChatMessages = async () => {
      try {
        const chatMessages = await messagesAPI.getMessages(matchId as string);
  
        const formattedChatMessages: IMessage[] = chatMessages.map(message => {
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
      })
  
        setMessages(formattedChatMessages);
          
      } catch (error) {
        console.log('retrieveChatMessages error:', error);
      }

    };
    retrieveChatMessages();
  }, []);

  const onSend = useCallback((messages: IMessage[] = []) => {
    try {
      const sendMessage = async () => {
        if (messages) {
          console.log(messages[0]);

          await messagesAPI.sendMessage(matchId as string, userId, messages[0].text)
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
          )
        }
      };
      sendMessage();
    } catch (error) {
      console.log('sendMessage error:', error);
    }
  }, []);

  return (
    <View className={`flex-1 mb-6`}>
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

        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
      />
    </View>
  )
};

export default ChatPage;