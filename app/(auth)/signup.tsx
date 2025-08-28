import FormComponent from '@/components/FormComponent';
import { FormInputData } from '@/type';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const formInputData: FormInputData[] = [
  {
    name: 'username',
    placeholder: 'enter your username',
    label: 'username',
    keyboardType: 'default',
  },
  {
    name: 'email',
    placeholder: 'enter your email',
    label: 'email',
    keyboardType: "email-address",
  },
  {
    name: 'password',
    placeholder: 'enter your password',
    label: 'password',
    keyboardType: "default",
  },
];

const SignUp = () => {
  return (
    <View>
      <FormComponent formInputData={formInputData} />
    <View
        className='flex justify-center flex-row mt-5 gap-2 border-t border-primary p-3'
      >
        <Text>
          already have an account?
        </Text>
        <Link 
          href={'/(auth)/signin'}
          className='text-primary'
        >
          sign in
        </Link>
      </View>
    </View>
  )
}

export default SignUp