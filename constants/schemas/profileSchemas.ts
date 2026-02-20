import * as yup from 'yup';

export const profileSetupSchema = (isEditing: boolean) => yup.object({
  username: yup
    .string()
    .required('name is required')
    .min(3, 'username should have more than 3 characters')
    .max(24, 'maximum 24 characters'),
  accountType: yup
    .string()
    .oneOf(['owner', 'seeker', 'shelter'])
    .required('choose one'),
  images: yup
    .array()
    .min(1, 'add at least one photo')
    .required('add at least one photo'),
  location: yup
    .object({
      city: yup
        .string()
        .required(),
      coordinates: isEditing 
        ? yup.object({
          lat: yup.number().required(),
          lng: yup.number().required()
        }).optional().default(undefined)
        : yup.object({
          lat: yup.number().required(),
          lng: yup.number().required()
        })
        .required()
    })
    .required(),
  bio: yup
    .string()
    .required('bio is required')
    .min(12, 'don\'t be shy (at least 12 characters)')
    .max(240, 'max length is 240 characters'),
});

export const reportProfile = yup.object({
  description: yup
    .string()
    .required(),
  reason: yup
    .string()
    .oneOf(['inappropriate', 'fake', 'spam', 'harassment', 'other'])
    .required()
});