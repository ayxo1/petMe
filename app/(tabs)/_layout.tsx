import { pb } from '@/backend/config/pocketbase';
import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { useChatStore } from '@/stores/useChatStore';
import { useLikesStore } from '@/stores/useLikesStore';
import { TabBarIconProps } from '@/types/components';
import { Redirect, Tabs, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

const TabBarIcon = ({focused, icon, red = false}: TabBarIconProps) => (
  <View className='mb-2'>
    <Image 
      source={icon}
      className='size-9'
      resizeMode='contain'
      tintColor={focused ? (red ? 'red' : Colors.secondary) : '#000000'}
    />
  </View>
);

const TabsLayout = () => {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  const { registrationState } = useAuthStore();
  const { pets } = usePetStore();
  const { subscribeToLikesCount, unreadCount, fetchIncomingLikesProfiles } = useLikesStore();
  const { checkUnreadStatus, subscribeToMessages, hasUnreadMessages } = useChatStore();

  const isNewOwner = registrationState === 'completed' && pets.length === 0 && user?.accountType === 'owner';

  useEffect(() => {
    let unsubscribeLikes: () => void;
    let unsubscribeChatMessages: () => void;

    const init = async () => {
      try {
        await fetchIncomingLikesProfiles();

        if (user?.id) {
          unsubscribeLikes = await subscribeToLikesCount(user.id);

          await checkUnreadStatus(user.id);

          unsubscribeChatMessages = await subscribeToMessages(user.id);
        }
      } catch (error) {
        console.log('error fetching incomingLikes / subscribeLikes/Chat: ', error);
      }
    }

    if (isAuthenticated) init();

    return () => {
      if (unsubscribeLikes) unsubscribeLikes();
      if (unsubscribeChatMessages) unsubscribeChatMessages();
    }
  }, [isAuthenticated, user?.id])

  if (!user) return;

  if(!isAuthenticated) return <Redirect href='/signin' />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          marginHorizontal: 30,
          height: 70,
          position: 'absolute',
          paddingBottom: 10,
        },
        tabBarInactiveTintColor: '#000000',
        tabBarActiveTintColor: Colors.secondary,
      }}
    >
      <Tabs.Screen
        name='profile'
        options={{
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}) => (
            <>
              {isNewOwner && (
              <View className='absolute bottom-6 left-4 z-10 rounded-xl py-1 px-2 w-28'>
                <Text className='text-red-600 text-xs'>(new!)</Text>
              </View>
              )}
              <TabBarIcon 
                focused={focused}
                icon={icons.profile}
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name='likes'
        options={{
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}) => (
            <>
            {unreadCount > 0 && (
              <View className='absolute bottom-6 left-7 z-10 bg-red-500/90 px-2 rounded-full'>
                <Text className='text-white text-xs'>{unreadCount}</Text>
              </View>
            )}
            <TabBarIcon
              focused={focused}
              icon={icons.pawLike}
              red
            />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          title: 'explore',
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}) => (
            <TabBarIcon 
              focused={focused}
              icon={icons.search}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='connect'
        options={{
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}) => (
            <>
            {hasUnreadMessages && (
              <View className='absolute bottom-5 left-6 z-10 rounded-full'>
                <Text className=''>🔴</Text>
              </View>
            )}
            <TabBarIcon 
              focused={focused}
              icon={icons.catPass}
            />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name='rescue'
        options={{
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}) => (
            <TabBarIcon 
              focused={focused}
              icon={icons.shelter}
            />
          ),
        }}
      />
    </Tabs>
  )
}

export default TabsLayout