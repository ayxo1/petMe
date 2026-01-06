import Colors from '@/constants/Colors';
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

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
        _id: 2,
        name: 'John Doe',
        avatar: 'https://placeimg.com/140/140/any',
        },
      },
      {
        _id: 2,
        text: 'Hello developer developer developer developer developer developer',
        createdAt: new Date(),
        user: {
        _id: 2,
        name: 'John Doe',
        avatar: 'https://placeimg.com/140/140/any',
        },
      },
      {
        _id: 3,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
        _id: 2,
        name: 'John Doe',
        avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    )
  }, []);

  return (
    <View className={`flex-1 mb-6`}>
      <GiftedChat
        messages={messages}
        textInputProps={{
          style: { color: Colors.secondary }
        }}
        onSend={(messages: any) => onSend(messages)}
        user={{
          _id: 1,
        }}
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