import { icons } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { TabBarIconProps } from '@/types/components';
import { Redirect, Tabs, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Image, View } from 'react-native';

const TabBarIcon = ({focused, icon}: TabBarIconProps) => (
  <View>
    <Image 
      source={icon}
      className='size-9'
      resizeMode='contain'
      tintColor={focused ? Colors.secondary : '#000000'}
    />
  </View>
);

const TabsLayout = () => {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initAuth = useAuthStore(state => state.init);

  const segments = useSegments();

  const isTabBarVisible = () => {
    
    if (segments[1] === 'connect' && segments.length > 2) {
        return false; 
    }
    return true; 
};

  useEffect(() => {
    initAuth();
  }, []);
  
  if(!isAuthenticated) return <Redirect href='/signin' />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // tabBarShowLabel: false,
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
          tabBarIcon: ({focused}: {focused: boolean}) => (
            <TabBarIcon 
              focused={focused}
              icon={icons.profile}
            />
          ),
        }}
      />
        <Tabs.Screen
          name='rescue'
          options={{
            sceneStyle: {
              backgroundColor: Colors.primary
            },
            tabBarIcon: ({focused}: {focused: boolean}) => (
              <TabBarIcon 
                focused={focused}
                icon={icons.shelter}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='index'
          options={{
            sceneStyle: {
              backgroundColor: Colors.primary
            },
            tabBarIcon: ({focused}: {focused: boolean}) => (
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
            tabBarIcon: ({focused}: {focused: boolean}) => (
              <TabBarIcon 
                focused={focused}
                icon={icons.catPass}
              />
            ),
          }}
        />
      <Tabs.Screen
        name='settings'
        options={{
          sceneStyle: {
            backgroundColor: Colors.primary
          },
          tabBarIcon: ({focused}: {focused: boolean}) => (
            <TabBarIcon 
              focused={focused}
              icon={icons.settings}
            />
          ),
        }}
      />
    </Tabs>
  )
}

export default TabsLayout