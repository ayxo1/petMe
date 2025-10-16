import * as yup from 'yup';

export const petFormSchema = yup.object({
    name: yup
        .string()
        .required('pet name is required')
        .min(2, 'name is only 1 character long')
        .max(50, 'name is too long'),
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
        .min(24, 'don\'t be shy')
        .max(240, 'max length is 240 characters'),
    isAvailableForAdoption: yup
        .boolean()
        .required(),
    adoptionStatus: yup
        .string()
        .oneOf(['available', 'pending', 'adopted'])
        .optional(),
    adoptionRequirements: yup
        .string()
        .optional(),
    adoptionReason: yup
        .string()
        .optional()
});