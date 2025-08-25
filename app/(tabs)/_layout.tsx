import { icons } from '@/constants'
import { TabBarIconProps } from '@/type'
import { Redirect, Tabs } from 'expo-router'
import { Image, View } from 'react-native'

const TabBarIcon = ({focused, icon}: TabBarIconProps) => (
  <View>
    <Image 
      source={icon}
      className='size-10'
      resizeMode='contain'
      tintColor={focused ? '#ffffff' : '#000000'}
    />
  </View>
)

const TabsLayout = () => {

  const isAuthenticated = false;

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
            backgroundColor: '#f5ea6e'
          },
          tabBarIcon: ({focused}) => (
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
            backgroundColor: '#f5ea6e'
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
          name='shelter'
          options={{
            sceneStyle: {
              backgroundColor: '#f5ea6e'
            },
            tabBarIcon: ({focused}) => (
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
            backgroundColor: '#f5ea6e'
          },
          tabBarIcon: ({focused}) => (
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