import { icons } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { TabBarIconProps } from '@/types/components';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Image, View } from 'react-native';

const TabBarIcon = ({focused, icon}: TabBarIconProps) => (
  <View>
    <Image 
      source={icon}
      className='size-10'
      resizeMode='contain'
      tintColor={focused ? '#ffffff' : '#000000'}
    />
  </View>
);

const TabsLayout = () => {

  const backgroundColor = '#f5c66e';

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initAuth = useAuthStore(state => state.init);

  useEffect(() => {
    initAuth();
  }, []);
  
  if(!isAuthenticated) return <Redirect href='/signin' />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          marginHorizontal: 30,
          height: 70,
          position: 'absolute',
          
        },
      }}
    >
      <Tabs.Screen
        name='profile'
        options={{
          sceneStyle: {
            backgroundColor
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
        name='index'
        options={{
          sceneStyle: {
            backgroundColor
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
          name='shelter'
          options={{
            sceneStyle: {
              backgroundColor
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
        name='settings'
        options={{
          sceneStyle: {
            backgroundColor
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