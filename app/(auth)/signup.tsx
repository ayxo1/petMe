import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { authSignUpSchema } from '@/constants/schemas/authSchemas';
import { useAuthStore } from '@/stores/authStore';
import { SignUpFormData } from '@/types/auth';
import { FormInputData } from '@/types/components';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { ClientResponseError } from 'pocketbase';
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
    secureTextEntry: true
  },
  {
    name: 'passwordConfirm',
    placeholder: 'confirm your password',
    label: 'confirm password',
    keyboardType: "default",
    secureTextEntry: true
  },
];

const SignUp = () => {

  const { signUp, isLoading, setRegistrationState } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: yupResolver(authSignUpSchema)
  })

  const submit = async (data: SignUpFormData) => {
    console.log('submit pressed');
    
    try {
      await signUp(data);

      setRegistrationState('signed_up');
      router.replace('/(auth)/profile-setup');
    } catch (error) {
      if (error instanceof ClientResponseError && error.response.data.email.message === 'Value must be unique.') {
        Alert.alert('an account with such email already exists');
      } else {
        console.log(error, ' signup error');
        Alert.alert('something went wrong, please try again');
      }
    }
  }

  return (
    <View>
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
              secureTextEntry={inputController.name === 'password' || inputController.name === 'passwordConfirm'}
            />
          </Fragment>
        ))}
        <ButtonComponent 
        title='submit' 
        onPress={handleSubmit(submit)}
        isLoading={isLoading}
        />
      </View>
    <View
        className='flex justify-center flex-row mt-5 gap-2 border-t border-secondary p-3'
      >
        <Text className='text-xl'>
          already have an account?
        </Text>
        <Link 
          href={'/(auth)/signin'}
          className='text-secondary text-xl'
        >
          sign in
        </Link>
      </View>
    </View>
  )
}

export default SignUp;