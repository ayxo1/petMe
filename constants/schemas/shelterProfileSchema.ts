import * as yup from 'yup';

export const shelterProfileSchema = yup.object({
    name: yup
        .string()
        .required('name is required')
        .min(2, 'name is only 1 character long')
        .max(24, 'name is too long, maximum 24 characters'),
    address: yup
        .string()
        .required('address is required to find your shelter')
        .min(3, 'an address can\'t be 2 characters long surely'),
    description: yup
        .string()
        .required('description is required')
        .min(24, 'at least 24 characters')
        .max(240, 'max length is 240 characters'),
    image: yup
        .string()
        .nonNullable('add at least one photo')
        .required('add at least one photo'),
});