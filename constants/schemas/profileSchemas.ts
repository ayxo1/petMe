import * as yup from 'yup';

export const profileSetupSchema = yup.object({
  accountType: yup.string().oneOf(['owner', 'seeker', 'shelter']).required('account type is required'),
  city: yup.string().required('city is required'),
  bio: yup.string().required('bio is required').min(24, 'don\'t be shy').max(240, 'max length is 240 characters'),
});