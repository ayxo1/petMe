import ButtonComponent from '@/components/ButtonComponent';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PetSetup from '../(auth)/pet-setup';

const Profile = () => {

  const { user ,signOut } = useAuthStore();
  const [ petSettigs, setPetSettings ] = useState(false);

  return (
    <SafeAreaView
      className='p-5 flex-1 max-h-[95%]'
    >
      <View>
        {/* profile preview */}
        <View>
          <Text className='text-center text-3xl'>{user?.username}</Text>
        </View>

        <View className='flex-row justify-center gap-6 m-4'>
          <TouchableOpacity
            className='p-2 border rounded-lg'
          >
            <Text className='color-slate-800'>edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`p-2 border rounded-lg ${petSettigs && 'bg-slate-100'}`}
            onPress={() => setPetSettings(!petSettigs)}
          >
            <Text className='color-slate-800'>add/edit pets</Text>
          </TouchableOpacity>
        </View>

      </View>

      <View
        className='bg-slate-100 rounded-xl'
      >
        {petSettigs && (
          <ScrollView
            keyboardShouldPersistTaps='handled'
            className='h-[80%] w-full'
            contentContainerStyle={{ flexGrow: 1 }}
          >

            <PetSetup />
          </ScrollView>
        )}
      </View>
      <View className='flex-1 justify-end'>
        <ButtonComponent 
          title='sign out'
          onPress={signOut}
          style='bg-red-600'
          textStyle='color-white'
        />
      </View>
    </SafeAreaView>
  )
}

export default Profile