import { pb } from "@/backend/config/pocketbase";
import { eventFormSchema } from "@/constants/schemas/eventPageSchema";
import { useAuthStore } from "@/stores/authStore";
import { EventPage, FormInputData } from "@/types/components";
import { getFileName } from "@/utils/imageUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, FlatList, Switch, Text, TouchableOpacity, View } from "react-native";
import AvatarComponent from "./AvatarComponent";
import ButtonComponent from "./ButtonComponent";
import InputController from "./controllers/InputController";
import Modal from "./Modal";


interface EventFormProps {
    initialData?: EventPage;
    // onSubmit: (data: Partial<EventPage>) => Promise<void>;
    submitButtonText?: string; 
};

const formInputData: FormInputData[] = [
    { name: 'eventName', label: 'event name*', placeholder: 'e.g., orange cat owners gathering', spellCheck: true },
    { name: 'synopse', label: 'synopse*', placeholder: 'a short description of the event', spellCheck: true },
    { name: 'description', label: 'description*', placeholder: '', spellCheck: true },
    { name: 'address', label: 'location*', placeholder: '' },
];

const EventForm = ({ initialData, submitButtonText = 'save'}: EventFormProps) => {

    const user = useAuthStore(state => state.user);
    if (!user) return;

    const [isDeleteModal, toggleIsDeleteModal] = useState(false);
    const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
    const [showPicker, setShowPicker] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(eventFormSchema),
        defaultValues: initialData ? { ...initialData } : { }
    });

    const eventImage = watch('image');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images']
        });
        if(!result.canceled) {
            const converted = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.6 }
            );

            setValue('image', 
                converted.uri, 
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            );
        };
        
    };

     const removeImage = () => {
        setValue('image', '', {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const onSubmit = async (data: Partial<EventPage>) => {

        // const eventObject = {
        //     ...data,
        //     organizerId: user.id,
        //     organizerName: user.username,
        //     date: data.date ? new Date(data.date).toISOString().replace('T', ' ') : '',
        //     image: data.image ? {
        //         uri: data.image,
        //         name: getFileName(data.image),
        //         type: 'image/jpeg'
        //     } : ''
        // }

        const eventObject = new FormData();
        Object.keys(data).forEach(key => {
            if (key !== 'image' && data[key] !== undefined) {
            const value = data[key];
            if (typeof value === 'object') {
                eventObject.append(key, JSON.stringify(value))
            } else if (key === 'date') {
                eventObject.append(key, new Date(value).toISOString().replace('T', ' '))
            } else eventObject.append(key, data[key].toString());
            }
        });
    
        if (data.image) {
            if (data.image.includes('file://')) {
                eventObject.append('image', {
                    uri: data.image,
                    name: getFileName(data.image),
                    type: 'image/jpeg'
                });
            } else {
                const fileName = data.image.split('/').pop()?.split('?')[0];
                if (fileName) eventObject.append('image', fileName);
            }
        }

        if (initialData) {
            try {
                const result = await pb.collection('events').update(initialData.id, eventObject);
                Alert.alert('success!', 'your event is successfully updated', [
                    {
                        text: 'ok',
                        onPress: () => router.replace({
                            pathname: '/eventPages/[id]',
                            params: {
                                id: result.id,
                                organizerId: result.organizerId,
                                organizerName: result.organizerName,
                                eventName: result.eventName,
                                description: result.description,
                                address: result.address,
                                date: result.date,
                                image: result.image ? `${pb.baseURL}/api/files/events/${result.id}/${result.image}` : '',
                            }
                        })
                    }
                ]);
                return;
            } catch (error) {
                console.log('EventForm.tsx onSubmit update error:', error);
                Alert.alert('error', 'an error occurred updating the event, please try again');
                throw error;
            }
        }

        try {
            eventObject.append('organizerId', user.id);
            eventObject.append('organizerName', user.username);
            const result: EventPage = await pb.collection('events').create(eventObject);
            Alert.alert('success!', 'your event is successfully added', [
                {
                    text: 'ok',
                    onPress: () => router.replace({
                        pathname: '/eventPages/[id]',
                        params: {
                            id: result.id,
                            organizerId: result.organizerId,
                            organizerName: result.organizerName,
                            eventName: result.eventName,
                            description: result.description,
                            address: result.address,
                            date: result.date,
                            image: result.image ? `${pb.baseURL}/api/files/events/${result.id}/${result.image}` : '',
                        }
                    })
                }
            ]);
        } catch (error) {
            console.log('event-setup.tsx onSubmit error:', error);
            Alert.alert('error', 'an error occurred adding an event, please try again');
        }
    };

    return (
        <View className="flex-1 px-5 gap-3">

            {(isDeleteModal && initialData) ? (
                <Modal
                    isOpen={isDeleteModal}
                    toggleModal={toggleIsDeleteModal}
                    styleProps='w-3/4 h-1/6 bg-primary'
                >
                    <View className="">
                        <Text className="text-secondary p-6 text-center">
                            are you sure you want to delete the <Text className="font-bold">{initialData.eventName} </Text>event?
                        </Text>
                        <View className="flex-row gap-2 justify-center mt-4">
                            <ButtonComponent 
                                style="bg-red-600"
                                title="delete"
                                onPress={async () => {
                                    try {
                                        await pb.collection('events').delete(initialData.id);
                                        Alert.alert('success!',
                                            `${initialData.eventName} is deleted`,
                                            [
                                                {
                                                    text: 'ok', onPress: () => {router.replace('/(tabs)/events')}
                                                }
                                            ]
                                        );
                                    } catch (error) {
                                        Alert.alert('error', 'an error occurred, please try again');
                                        console.log('EventForm.tsx, delete an event error:', error);
                                    }
                                }}
                            />
                            <ButtonComponent 
                                style=""
                                title="cancel"
                                onPress={() => toggleIsDeleteModal(false)}
                            />
                        </View>
                    </View>
                </Modal>
            ) : null}

            <View className="mt-2 flex-row gap-2 items-center justify-center">
                {eventImage &&                 
                    (
                    <View key={eventImage}>
                        <TouchableOpacity
                            className="absolute z-10 right-2 top-2"
                            onPress={removeImage}
                        >
                            <Text className="text-xl text-red-700 border rounded-full border-red-500 bg-red-300/60 px-2">x</Text>
                        </TouchableOpacity>
                        <AvatarComponent 
                            uri={eventImage}
                            style="w-32 h-32 rounded-2xl"
                        />
                    </View>
                    )
                }
            </View>

            
            <TouchableOpacity 
                className="flex-row justify-start w-32 items-center mb-7"
                onPress={pickImage}
            >
                <Text className="label">event picture</Text>
                <Text className="text-l">(+)</Text>
            </TouchableOpacity>

            <View>

                <View className="flex-row w-52 items-center">
                    <Text className="label">date* <Text className="font-light">(displayed in your current timezone)</Text></Text>
                    {(!showPicker && date) ? <Text className="text-center">{dayjs(date).format('DD MMM HH:mm')}</Text> : null}
                    <TouchableOpacity 
                        className={`${(!showPicker && date) && 'ml-2'} bg-secondary px-3 py-1 rounded-2xl`}
                        onPress={() => setShowPicker(!showPicker)}
                    >
                        <Text className="text-primary">{showPicker ? 'save' : 'set'}</Text>
                    </TouchableOpacity>
                </View>

                {/* <View> */}
                
                {errors.date ? (
                    <View className='h-5'>
                        <Text className='text-red-500 text-center'>
                            {errors.date.message}
                        </Text>
                    </View>
                ) : null}

                 {/* </View> */}

                {showPicker && <View className="p-2 gap-2">
                    <View className="w-full flex-row gap-3 items-center bg-secondary/75 shadow shadow-secondary/40 rounded-2xl p-2 max-w-full">
                        <DateTimePicker 
                            value={date}
                            mode="datetime"
                            display="spinner"
                            onChange={(e, selectedDate) => {
                                // setShowPicker(false);
                                if(selectedDate) {
                                    setDate(selectedDate);
                                    setValue('date', selectedDate.toString(), 
                                    {
                                        shouldDirty: true,
                                        shouldValidate: true
                                    });
                                }
                            }}
                        />
                    </View>
                </View>}

            </View>
            

            <View>
                
                <View className='h-5'>
                    {errors.image && (
                        <Text className='text-red-500 text-center'>
                            {errors.image.message}
                        </Text>
                    )}
                </View>

            </View>

            {/* form */}
            <View className="gap-3">
                {formInputData.map((input, index) => (
                    <Fragment
                        key={index}
                    >
                        <InputController
                            control={control}
                            errors={errors}
                            {...input}
                        />
                    </Fragment>
                ))}
            </View>

            <View className="gap-2 flex-row justify-center mt-4">
                <ButtonComponent 
                    title={isSubmitting ? 'saving...' : submitButtonText}
                    onPress={handleSubmit(onSubmit)}
                    style="mt-2"
                />

                {initialData ? (
                    <ButtonComponent 
                        title="delete"
                        onPress={() => {toggleIsDeleteModal(!isDeleteModal)}}
                        style="mt-2 bg-red-600"
                    />
                ) : null}
            </View>

            <ButtonComponent 
                title='back'
                onPress={() => router.back()}
            />

        </View>
    );
};

export default EventForm;