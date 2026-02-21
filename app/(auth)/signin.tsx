import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { authSignInSchema } from '@/constants/schemas/authSchemas';
import { useAuthStore } from '@/stores/authStore';
import { SignInFormData } from '@/types/auth';
import { FormInputData } from '@/types/components';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';

const formInputData: FormInputData[] = [
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

const SignIn = () => {

  const { signIn, isLoading, setRegistrationState } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: yupResolver(authSignInSchema)
  })

  const submit = async ({email, password}: SignInFormData) => {
    try {
      await signIn({email, password});
      setRegistrationState('completed');
      router.replace('/');
    } catch (error) {
      console.log(error);
      if (error instanceof Error) Alert.alert(error.message, 'incorrect login or password, please try again', [
        {
          text: 'close',
        },
        {
          text: 'no account?',
          onPress: () => router.replace('/signup')
        }
      ]);
    }
  };

  return (
    <Fragment>
      <View
        className='gap-3 rounded-lg p-5'
      >
        {formInputData.map((inputController, index) => (
          <Fragment key={index}>
            <InputController
              control={control}
              errors={errors}
              name={inputController.name}
              placeholder={inputController.placeholder}
              label={inputController.label}
              keyboardType={inputController?.keyboardType}
              secureTextEntry={inputController.name === 'password'}
            />
          </Fragment>
        ))}
        <ButtonComponent 
          title='submit'
          onPress={handleSubmit(submit)}
          isLoading={isLoading}
        />
        <ButtonComponent 
          title="Clear Cache (Dev Only)"
          onPress={async () => {
            await AsyncStorage.clear();
            Alert.alert('Cache cleared', 'Restart the app');
          }}
        />
      </View>
      <View
        className='flex justify-center flex-row mt-5 gap-2 border-t border-secondary p-3'
      >
        <Text className='text-xl'>
          no account?
        </Text>
        <Link 
          href={'/(auth)/signup'}
          className='text-secondary text-xl'
        >
          sign up
        </Link>
      </View>
    </Fragment>
  )
}

export default SignIn;