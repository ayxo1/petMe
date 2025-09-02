import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { authSignInSchema } from '@/constants/schemas/authSchemas';
import { FormInputData, SignInFormData } from '@/type';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

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

  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: yupResolver(authSignInSchema)
  })

  const submit = (data: SignInFormData) => {
    console.log(data);
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
              secureTextEntry={inputController.name === 'password'}
            />
          </Fragment>
        ))}
        <ButtonComponent title='submit' onPress={handleSubmit(submit)}/>
      </View>
      <View
        className='flex justify-center flex-row mt-5 gap-2 border-t border-primary p-3'
      >
        <Text>
          no account?
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