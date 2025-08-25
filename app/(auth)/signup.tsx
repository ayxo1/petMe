import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

const SignUp = () => {
  return (
    <View>
      <Text>Sign up</Text>
      <Button 
        title='sign in'
        onPress={() => router.push('/signin')}
      />
    </View>
  )
}

export default SignUp