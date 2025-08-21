import { icons } from '@/constants'
import { TabBarIconProps } from '@/type'
import { Tabs } from 'expo-router'
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
          position: 'absolute'
        }
      }}
    >
      <Tabs.Screen
        name='profile'
        options={{
          // title: 'connect',
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
          tabBarIcon: ({focused}) => (
            <TabBarIcon 
            focused={focused}
            icon={icons.search}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
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