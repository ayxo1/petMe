import * as yup from 'yup';

export const petFormSchema = yup.object({
    name: yup
        .string()
        .required('pet name is required')
        .min(2, 'name is only 1 character long')
        .max(24, 'name is too long, maximum 24 characters'),
    species: yup
        .string()
        .oneOf(['dog', 'cat', 'bird', 'rodent', 'other'])
        .required(),
    breed: yup
        .string()
        .optional(),
    age: yup
        .number()
        .required('age is required, approximate works')
        .min(0, 'it can\t time travel surely')
        .max(50, 'let\'s flatter it making it younger, shall we'),
    bio: yup
        .string()
        .required('bio is required')
        .min(24, 'don\'t be shy, at least 24 characters')
        .max(240, 'max length is 240 characters'),
    images: yup
        .array()
        .min(1, 'add at least one photo, let us see your pet :)')
        .required('add at least one photo, let us see your pet :)'),
    isAvailableForAdoption: yup
        .boolean()
        .required(),
    adoptionStatus: yup
        .string()
        .transform(val => val === '' ? '' : val)
        .oneOf(['available', 'pending', 'adopted', ''])
        .optional(),
    adoptionRequirements: yup
        .string()
        .optional(),
    adoptionReason: yup
        .string()
        .optional()
});