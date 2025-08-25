import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

const SignIn = () => {
  return (
    <View>
      <Text>Sign in</Text>
      <Button 
        title='sign up'
        onPress={() => router.push('/signup')}
      />
    </View>
  )
}

export default SignIn