import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { usePetStore } from '@/stores/petStore';
import { useChatStore } from '@/stores/useChatStore';
import { useLikesStore } from '@/stores/useLikesStore';
import { TabBarIconProps } from '@/types/components';
import * as Notifications from 'expo-notifications';
import { Redirect, router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

const TabBarIcon = ({focused, icon, red = false}: TabBarIconProps) => (
  <View className='mb-2'>
    <Image 
      source={icon}
      className={`${ icon !== icons.exploreNew ? 'size-9' : 'size-14'}`}
      resizeMode='contain'
      tintColor={focused ? (red ? '#f53361' : Colors.secondary) : Colors.tabIcons}
    />
  </View>
);

const TabsLayout = () => {

  const { user, isAuthenticated, registrationState } = useAuthStore();
  const { pets } = usePetStore();
  const { subscribeToLikesCount, unreadCount, fetchIncomingLikesProfiles } = useLikesStore();
  const { checkUnreadStatus, subscribeToMessages, hasUnreadMessages, unreadChatRooms } = useChatStore();

  const isNewOwner = registrationState === 'completed' && pets.length === 0 && user?.accountType === 'owner';

  const lastNotificationResponse = Notifications.useLastNotificationResponse();

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
        console.log('error setting up subscriptions:', error);
      }
    };
    if (isAuthenticated && user?.id && user.regState === 'completed') {
      init();
    }
    return () => {
      if (unsubscribeLikes) unsubscribeLikes();
      if (unsubscribeChatMessages) unsubscribeChatMessages();
    };
  }, [isAuthenticated, user?.id, user?.regState]);

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const data = lastNotificationResponse.notification.request.content.data;

      if ((data.type === 'message' || data.type === 'match') && data.matchId) {
        router.navigate('/(tabs)/connect');
      }
    }
  }, [lastNotificationResponse]);

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
        tabBarInactiveTintColor: Colors.tabIcons,
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
              <View className='absolute bottom-6 left-7 z-10 bg-red-500/80 px-1.5 rounded-full'>
                <Text className='text-white text-s'>{unreadCount}</Text>
              </View>
            )}
            <TabBarIcon
              focused={focused}
              icon={icons.likesIcon}
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
              icon={icons.exploreNew}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='events'
        options={{
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}) => (
            <TabBarIcon 
              focused={focused}
              icon={icons.eventsIcon}
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
              icon={icons.connectIcon}
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
              icon={icons.rescueIcon}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;