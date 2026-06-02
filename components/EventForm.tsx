import { pb } from "@/backend/config/pocketbase";
import Colors from "@/constants/Colors";
import { eventFormSchema } from "@/constants/schemas/eventPageSchema";
import { useAuthStore } from "@/stores/authStore";
import { FormInputData, PBEventPage } from "@/types/components";
import { getFileName } from "@/utils/imageUtils";
import { getAddressFromCoordinates } from "@/utils/location";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import AvatarComponent from "./AvatarComponent";
import ButtonComponent from "./ButtonComponent";
import InputController from "./controllers/InputController";
import Modal from "./Modal";


interface EventFormProps {
    initialData?: PBEventPage;
    submitButtonText?: string; 
};

const formInputData: FormInputData[] = [
    { name: 'eventName', label: 'event name*', placeholder: 'e.g., orange cat owners gathering', spellCheck: true },
    { name: 'synopse', label: 'synopse*', placeholder: 'a short description of the event', spellCheck: true },
    { name: 'description', label: 'description*', placeholder: 'min. 24 characters, max. 240', spellCheck: true },
    // { name: 'address', label: 'location*', placeholder: '' },
];

const EventForm = ({ initialData, submitButtonText = 'save'}: EventFormProps) => {

    const user = useAuthStore(state => state.user);
    if (!user) return;

    dayjs.extend(timezone);
    dayjs.extend(utc);

    const [isDeleteModal, toggleIsDeleteModal] = useState(false);
    const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
    const [showPicker, setShowPicker] = useState(false);

    const [isMapOpen, setIsMapOpen] = useState(false);
    const [eventCoords, setEventCoords] = useState<{latitude: number; longitude: number} | null>(null);
    const [calculatedAddress, setCalculatedAddress] = useState<string | null>(null);

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
    const allowMessaging = watch('allowMessaging');

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

    const onSubmit = async (data: Partial<PBEventPage>) => {

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
                        onPress: () => router.dismissTo({
                            pathname: '/eventPages/[id]',
                            params: {
                                id: result.id,
                                organizerId: result.organizerId,
                                organizerName: result.organizerName,
                                eventName: result.eventName,
                                description: result.description,
                                address: result.address,
                                coordinates: JSON.stringify(result.coordinates),
                                date: dayjs(result.date).format('MMM DD HH:mm'),
                                image: result.image ? `${pb.baseURL}/api/files/events/${result.id}/${result.image}` : '',
                                allowMessaging: result.allowMessaging ? 1 : 0
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
            const result: PBEventPage = await pb.collection('events').create(eventObject);
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
                            coordinates: JSON.stringify(result.coordinates),
                            date: dayjs(result.date).format('MMM DD HH:mm'),
                            image: result.image ? `${pb.baseURL}/api/files/events/${result.id}/${result.image}` : '',
                            allowMessaging: result.allowMessaging ? 1 : 0
                        }
                    })
                }
            ]);
        } catch (error) {
            console.log('event-setup.tsx onSubmit error:', error);
            Alert.alert('error', 'an error occurred adding an event, please try again');
        }
    };

    useEffect(() => {
        const getAddress = async () => {
            if (eventCoords) {
                const coordsToAddress = await getAddressFromCoordinates({ lat: eventCoords.latitude, lng: eventCoords.longitude });
                if (coordsToAddress) {
                    setCalculatedAddress(coordsToAddress.address);
                    setValue('address', coordsToAddress.address);
                    setValue('coordinates', eventCoords)
                }
            }
        };
        getAddress();
    }, [eventCoords]);

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

            {isMapOpen ? (
                <Modal
                    isOpen={isMapOpen}
                    toggleModal={setIsMapOpen}
                    styleProps=''
                >
                    <View className='w-96 h-[90%] mt-14 border border-primary'>

                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: user.location.coordinates?.lat || 0,
                                longitude: user.location.coordinates?.lng || 0,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            onPress={async (val) => {
                                setEventCoords({latitude: val.nativeEvent.coordinate.latitude, longitude: val.nativeEvent.coordinate.longitude});
                            }}
                        >
                        <Marker
                            coordinate={{ 
                                latitude: eventCoords?.latitude || user.location.coordinates?.lat || 0,
                                longitude: eventCoords?.longitude || user.location.coordinates?.lng || 0,
                            }}
                        />
                        </MapView>

                        <Text className="absolute-center-x bottom-20 shadow text-primary bg-secondary/70 p-1 rounded-2xl text-l font-bold">tap on the map to set the marker</Text>

                        <TouchableOpacity
                            onPress={() => setIsMapOpen(false)}
                        >
                            <Text className="absolute-center-x bottom-10 shadow text-primary bg-secondary/70 p-1 rounded-2xl text-l font-bold">save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="absolute top-2 left-2 z-50"
                            onPress={() => setIsMapOpen(false)}
                        >
                            <Text className="bg-red-500/80 px-2 rounded-sm text-primary font-bold">x</Text>
                        </TouchableOpacity>

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
                
                {errors.date ? (
                    <View className='h-5'>
                        <Text className='text-red-500 text-center'>
                            {errors.date.message}
                        </Text>
                    </View>
                ) : null}

                {showPicker && <View className="p-2 gap-2">
                    <View className="w-full flex-row gap-3 items-center bg-secondary/75 shadow shadow-secondary/40 rounded-2xl p-2 max-w-full">
                        <DateTimePicker 
                            value={date}
                            mode="datetime"
                            display="spinner"
                            onChange={(e, selectedDate) => {
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

            <View className="flex-row w-60">
                <Text className="label">allow direct messaging you</Text>
                <Switch
                    value={allowMessaging}
                    onValueChange={(val) => setValue('allowMessaging', val)}
                    trackColor={{ true: Colors.secondary, false: Colors.lighterSecondary}}
                    ios_backgroundColor={Colors.lighterSecondary}
                />
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

                <View>
                    <View className="flex-row w-24">
                        <Text className="label">location*</Text>
                        <TouchableOpacity 
                            className={`bg-secondary px-3 py-1 rounded-2xl`}
                            onPress={() => setIsMapOpen(true)}
                        >
                            <Text className="text-primary">set</Text>
                        </TouchableOpacity>
                    </View>
                    {calculatedAddress || initialData?.address ? (
                        <Text className="p-3 border-b border-b-lighterSecondary rounded-xl">{calculatedAddress || initialData?.address}</Text>
                    ) : null}
                </View>

                {errors.address ? (
                    <View className='h-5'>
                        <Text className='text-red-500 text-center'>
                            {errors.address.message}
                        </Text>
                    </View>
                ) : null}
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