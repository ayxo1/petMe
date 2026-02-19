import { messagesAPI, petsAPI } from '@/backend/config/pocketbase';
import AvatarComponent from '@/components/AvatarComponent';
import ButtonComponent from '@/components/ButtonComponent';
import Modal from '@/components/Modal';
import ProfileInterface from '@/components/ProfileInterface';
import ReportForm from '@/components/ReportForm';
import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { convertPBUserToUser, useAuthStore } from '@/stores/authStore';
import { convertPBPetToPetProfile } from '@/stores/petStore';
import { useChatStore } from '@/stores/useChatStore';
import { User } from '@/types/auth';
import { PBMessage } from '@/types/pbTypes';
import { PetProfile } from '@/types/pets';
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, BubbleProps, GiftedChat, IMessage, InputToolbar, InputToolbarProps } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const renderLoading = () => {
  return (
    <View 
      className='flex-1 justify-center items-center'
    >
      <Text className='text-gray-600/60 font-bold'>loading</Text>
      <ActivityIndicator size="small" className='color-gray-600/60' />
    </View>
  );
};

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
  const [unmatchModal, toggleUnmatchModal] = useState(false);

  const [isPetlistVisible, setIsPetlistVisible] = useState(false);

  const [matchData, setMatchData] = useState<User>();
  const [matchPetsList, setMatchPetsList] = useState<PetProfile[]>();

  const [selectedPetProfile, setSelectedPetProfile] = useState<PetProfile | null>();

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

useEffect(() => {
  const fetchMatchWithPets = async () => {
    try {
      const PBuser = await messagesAPI.getUser(otherUserId);
      const convertedUser = convertPBUserToUser(PBuser);
      setMatchData(convertedUser);

      if (otherUserType === 'owner') {
        try { 
          const PBmatchPets = await petsAPI.getUserPets(otherUserId);
          const convertedPets = PBmatchPets.map(convertPBPetToPetProfile);
          setMatchPetsList(convertedPets);
        } catch (error) {
          console.log('fetchMatchWithPets, PBmatchPets error, [id].tsx: ', error);
        }
      }
    } catch (error) {
      console.log('fetchMatchWithPets error, [id].tsx: ', error);
    }
  };
  fetchMatchWithPets();
}, [])

  return (
    <View className={`flex-1 mb-6`}>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <TouchableOpacity 
              className='flex-row items-center gap-2 pb-2'
              onPress={() => toggleMatchProfileModal(!matchProfileModal)}
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
            <View className="flex-row gap-1 items-center">
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
                <TouchableOpacity
                  onPress={() => setIsPetlistVisible(!isPetlistVisible)}
                >
                  <Text className='text-primary border border-primary p-1 rounded-xl'>{isPetlistVisible ? 'hide pets' : 'see pets'}</Text>
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
                    onPress={() => toggleUnmatchModal(!unmatchModal)}
                  >
                    {unmatchModal && (
                      <Modal
                        isOpen={unmatchModal}
                        toggleModal={toggleUnmatchModal}
                      >
                        <View className='p-4'>
                          <View className='p-2 mb-4'>
                            <Text className='font-bold text-xl mb-2 text-center'>do you want to unmatch this user?</Text>
                            <Text className='text-center'>the chat room will be automatically closed</Text>
                          </View>
                          <View className='flex-row justify-center gap-2'>
                            <ButtonComponent
                              title='yes'
                              onPress={() => {
                                unmatch();
                                toggleUnmatchModal(!unmatchModal);
                              }}
                              style='bg-red-900'
                              textStyle='text-primary'
                            />
                            <ButtonComponent
                              title='close'
                              onPress={() => {
                                toggleUnmatchModal(!unmatchModal);
                              }}
                              style='bg-red-900'
                              textStyle='text-primary'
                            />
                          </View>
                        </View>
                      </Modal>
                    )}
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

      {selectedPetProfile && (
        <Modal 
          isOpen={!!selectedPetProfile}
          toggleModal={() => setSelectedPetProfile(null)}
          styleProps='bg-transparent px-6'
        >
          <View
            className='w-full aspect-[0.55]'
          >
            <ProfileInterface 
              profileImages={selectedPetProfile.images}
              profileName={selectedPetProfile.name}
              profileDescription={selectedPetProfile.bio}
              />
          </View>
        </Modal>
      )}

      {isPetlistVisible && (
        <View className='items-center'>
          <FlatList
            data={matchPetsList}
            horizontal
            contentContainerStyle={{ gap: 10, padding: 10 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => setSelectedPetProfile(item)}
                className='ml-1.5 max-w-32'
              >
                {!item.images[0] && (<ActivityIndicator size="small" className='color-gray-600/60 absolute left-[40%] top-[40%]' />)}
                <View
                  className='shadow rounded-full'
                  style={{ elevation: 5 }}
                >
                  <AvatarComponent 
                    uri={item.images[0]}
                    style='w-24 h-24 rounded-2xl'
                  />
                </View>
                <Text className='text-center text-secondary font-bold p-2 max-w-24' numberOfLines={1} ellipsizeMode='tail'>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
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
        renderLoading={renderLoading}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset, enabled: !isReportModal }}
      />
    </View>
  )
};

export default ChatPage;