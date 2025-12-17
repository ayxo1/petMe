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
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number'),
  passwordConfirm: yup
    .string()
    .required('please confirm your password')
    .oneOf([yup.ref('password')], 'passwords must match')
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