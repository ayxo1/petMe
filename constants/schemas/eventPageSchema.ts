import * as yup from 'yup';

export const eventFormSchema = yup.object({
    eventName: yup
        .string()
        .required('event name is required')
        .min(2, 'event name is only 1 character long')
        .max(24, 'event name is too long, maximum 24 characters'),
    date: yup
        .string()
        .required('event date is required')
        .test('is-future', "an event can't be in the past",
            (value) => !value || new Date(value) > new Date()
        ),
    synopse: yup
        .string()
        .required('synopse is required')
        .min(12, 'at least 12 characters')
        .max(36, 'max length is 36 characters'),
    description: yup
        .string()
        .required('description is required')
        .min(24, 'at least 24 characters')
        .max(240, 'max length is 240 characters'),
    address: yup
        .string()
        .required('please set the address'),
    coordinates: yup.object({
        latitude: yup.number().required(),
        longitude: yup.number().required()
    }),
    allowMessaging: yup
        .boolean()
        .required()
        .default(true),
    image: yup
        .string()
        .optional(),
});