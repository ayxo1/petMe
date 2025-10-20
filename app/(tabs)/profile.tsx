import ButtonComponent from '@/components/ButtonComponent';
import { useAuthStore } from '@/stores/authStore';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {

  const signOut = useAuthStore(state => state.signOut);

  return (
    <SafeAreaView
      className='p-5'
    >
      <Text className='text-center text-3xl'>profile</Text>
      <ButtonComponent 
        title='sign out'
        onPress={signOut}
        style='bg-red-600'
        textStyle='color-white'
      />
    </SafeAreaView>
  )
}

export default Profile