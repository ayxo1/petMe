import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { authSchema } from '@/constants/schemas/authSchemas';
import { SignUpFormData } from '@/type';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';


const FormComponent = () => {

  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: yupResolver(authSchema)
  })

  const submit = (data: SignUpFormData) => {
    console.log(data);
  }

  console.log(JSON.stringify(errors, null, 3));
  

  return (
    <View
      className='gap-3 rounded-lg p-5'
    >
      <InputController 
        control={control}
        name='username'
        placeholder='enter your name'
        label='username'
        keyboardType="default"
        errors={errors}
      />
      <InputController 
        control={control}
        name='email'
        placeholder='enter your email'
        label='email'
        keyboardType="email-address"
        errors={errors}
      />
      <InputController 
        control={control}
        name='password'
        placeholder='enter your password'
        label='password'
        keyboardType="default"
        secureTextEntry
        errors={errors}
      />


      <ButtonComponent title='submit' onPress={handleSubmit(submit)}/>
    </View>
  )
}

const SignUp = () => {
  return (
    <View>
      <FormComponent />
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