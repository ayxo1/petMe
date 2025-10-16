import * as yup from 'yup';

export const authSignUpSchema = yup.object({
  email: yup
    .string()
    .email('enter a valid email')
    .required('email is required'),
  username: yup
    .string()
    .required('name is required')
    .min(3, 'username should have more than 3 characters'),
  password: yup
    .string()
    .required('password is required')
    .min(8, 'password should include more than 8 characters')
});

export const authSignInSchema = yup.object({
  email: yup
    .string()
    .email('enter a valid email')
    .required('email is required'),
  password: yup.string()
    .required('password is required')
    .min(8, 'password should include more than 8 characters')
});