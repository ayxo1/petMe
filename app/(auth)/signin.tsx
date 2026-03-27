import { pb } from '@/backend/config/pocketbase';
import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import InputComponent from '@/components/InputComponent';
import Modal from '@/components/Modal';
import { authSignInSchema } from '@/constants/schemas/authSchemas';
import { useAuthStore } from '@/stores/authStore';
import { SignInFormData } from '@/types/auth';
import { FormInputData } from '@/types/components';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

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

  const [forgotPasswordModal, toggleForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
      // setRegistrationState('completed');
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
        
        {forgotPasswordModal && (
          <Modal
            isOpen={forgotPasswordModal}
            toggleModal={toggleForgotPasswordModal}
            withInput
            styleProps='bg-primary/90'
          >
            <View className='w-80 p-8 border border-secondary rounded-3xl'>
              <View className='mb-6 p-2'>
                <InputComponent 
                  label='enter your email'
                  placeholder='your email'
                  labelStyling='text-secondary'
                  keyboardType='email-address'
                  value={resetEmail}
                  onChangeText={(val) => setResetEmail(val)}
                />
              </View>
              <ButtonComponent 
                title='send a password reset link'
                onPress={async () => {
                  try {
                    await pb.collection('users').requestPasswordReset(resetEmail);
                    Alert.alert('a link to reset your password was sent to your email', '', [{
                      text: 'ok',
                      onPress: () => toggleForgotPasswordModal(!forgotPasswordModal)
                    }]);
                  } catch (error) {
                    console.log('signup, otp error: ', error);
                    Alert.alert('error', 'an error occurred, please double-check the email address and try again');
                  }
                }}
              />
            </View>
          </Modal>
        )}

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
        {/* <ButtonComponent 
          title="Clear Cache (Dev Only)"
          onPress={async () => {
            await AsyncStorage.clear();
            Alert.alert('Cache cleared', 'Restart the app');
          }}
        /> */}
      </View>
      <View>
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
        <View
          className='flex items-center border-secondary p-2'
        >
          <TouchableOpacity 
            className='text-secondary text-l'
            onPress={() => {toggleForgotPasswordModal(!forgotPasswordModal)}}
          >
            <Text className='text-xl text-secondary'>forgot password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Fragment>
  )
}

export default SignIn;