import ButtonComponent from '@/components/ButtonComponent';
import InputComponent from '@/components/InputComponent';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const SignIn = () => {
  return (
    <View
      className='gap-3 rounded-lg p-5 mt-5'
    >
      <InputComponent 
        placeholder='enter your email'
        value=''
        onChangeText={() => {}}
        label='email'
        keyboardType="email-address"
      />
      <InputComponent 
        placeholder='enter your password'
        value=''
        onChangeText={() => {}}
        label='password'
        secureTextEntry={true}
      />
      <ButtonComponent title='sign in' />

      <View
        className='flex justify-center flex-row mt-5 gap-2 border-t border-primary p-3'
      >
        <Text>
          new here?
        </Text>
        <Link 
          href={'/(auth)/signup'}
          className='text-primary'
        >
          sign up
        </Link>
      </View>
    </View>
  )
}

export default SignIn