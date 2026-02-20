import { petFormSchema } from "@/constants/schemas/petSchemas";
import { FormInputData } from "@/types/components";
import { PetFormData, PetSpecies } from "@/types/pets";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { FlatList, Switch, Text, TouchableOpacity, View } from "react-native";
import AvatarComponent from "../AvatarComponent";
import ButtonComponent from "../ButtonComponent";
import InputController from "../controllers/InputController";

// if adoptionStatus is switched back to Off - remove adoption form data

interface PetFormProps {
    initialData?: Partial<PetFormData>;
    onSubmit: (data: PetFormData) => Promise<void>;
    submitButtonText?: string; 
};

const formInputData: FormInputData[] = [
    { name: 'name', label: 'pet name*', placeholder: 'e.g., mr. fluff' },
    { name: 'breed', label: 'breed (optional)', placeholder: '' },
    { name: 'age', label: 'age (years)*', placeholder: 'e.g., 3', keyboardType: 'numeric' },
    { name: 'bio', label: 'bio*', placeholder: 'describe your pet', spellCheck: true },
];

const PetForm = ({ initialData, onSubmit, submitButtonText = 'save'}: PetFormProps) => {

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(petFormSchema),
        defaultValues: initialData ? { ...initialData } : { isAvailableForAdoption: false }
    });

    const species = watch('species');
    const petImages = watch('images');
    const isAvailableForAdoption = watch('isAvailableForAdoption');
    const adoptionStatus = watch('adoptionStatus');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // allowsEditing: true,
            // aspect: [4, 3],
            // quality: 0.6
        });
        if(!result.canceled) {
            const converted = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
            );

            const currentImages = watch('images') || [];
            setValue('images', 
                [...currentImages, converted.uri], 
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            );
        };

        // need an apple dev account, gg
        // const result = await ImagePicker.launchImageLibraryAsync({
        // mediaTypes: 'images',
        // allowsEditing: false,  // Skip iOS's locked editor
        // quality: 1,
        // });
        // if (!result.assets?.[0]?.uri) return;
        
        // const cropped = await ExpoImageCropTool.openCropperAsync({
        //     imageUri: result.assets[0].uri,
        //     aspectRatio: 16 / 9,  // **Your ratio** (e.g., 1 for square)
        //     shape: 'rectangle',
        //     rotationEnabled: true,
        // });

        // console.log(cropped.path);
        
    };

    const removeImage = (imageToRemove: string) => {
        const updatedImages = (petImages || []).filter(uri => uri !== imageToRemove);
        setValue('images', updatedImages, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const speciesOptions: { 
        value: PetSpecies; 
        label: string;
        icon: string
    }[] = [
        { value: 'dog', label: 'dog', icon: '🐕'},
        { value: 'cat', label: 'cat', icon: '🐈'},
        { value: 'bird', label: 'bird', icon: '🐦'},
        { value: 'rodent', label: 'rodent', icon: '🐿️'},
        { value: 'other', label: 'other', icon: '👽'},
    ];

    return (
        <View className="flex-1 px-5 gap-3">
            <View className="mt-2 flex-row gap-2 items-center justify-center">
                {petImages && petImages.map(image =>                
                    (
                    <View key={image}>
                        <TouchableOpacity
                            className="absolute z-10 right-2 top-2"
                            onPress={() => removeImage(image)}
                        >
                            <Text className="text-xl text-red-700 border rounded-full border-red-500 bg-red-300/60 px-2">x</Text>
                        </TouchableOpacity>
                        <AvatarComponent 
                            uri={image}
                            style="w-32 h-32 rounded-2xl"
                        />
                    </View>
                    )
                )}
            </View>

            <View>
            {petImages === undefined || petImages.length < 3 ? (
                <TouchableOpacity 
                    className="flex-row justify-start w-28 items-center"
                    onPress={pickImage}
                >
                    <Text className="label">load a photo</Text>
                    <Text className="text-l">(+)</Text>
                </TouchableOpacity>
            ) : (
                <Text className="label text-secondary text-center">you uploaded the maximum number of pictures</Text>
            )}
                
            <View className='h-5 mt-2'>
                {errors.images && (
                    <Text className='text-red-500 text-center'>
                        {errors.images.message}
                    </Text>
                )}
            </View>

            </View>
            {/* species  */}
            <View className="mb-6">
                <View className="">
                    <Text className="label">
                        species*
                    </Text>
                    <View
                        className="flex-row flex-wrap gap-2 mt-2"
                    >
                        <FlatList 
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerClassName="gap-x-3 pb-3"
                            data={speciesOptions}
                            keyExtractor={(item) => item.label}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    key={item.label}
                                    className={`${species === item.value ? 'bg-secondary' : 'bg-gray-200'} rounded-full px-4 py-3`}
                                    onPress={() => setValue('species', item.value)}
                                >
                                    <Text>{item.icon} {item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <View className='h-5 mt-2'>
                    {errors.species && (
                        <Text className='text-red-500 text-center'>
                            {errors.species.message}
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
            {/* adoption availability toggle */}
                <View className="flex-row items-center justify-between my-4 p-4 bg-gray-100 rounded-lg gap-2">
                    <Text className="text-black font-bold">
                        looking for a new home for your pet?
                    </Text>
                    <Switch
                        value={isAvailableForAdoption}
                        onValueChange={(val) => {
                            setValue('isAvailableForAdoption', val);
                            if (!val) {
                                setValue('adoptionRequirements', undefined);
                                setValue('adoptionReason', undefined);
                                setValue('adoptionStatus', undefined);
                            }
                        }}
                    />
                </View>
            {/* adoption deets */}
            {isAvailableForAdoption && (
                <View className="gap-3 border-t border-b border-gray-300">
                    <Text 
                        className="mt-2 text-center text-xl color-gray-400 font-bold"
                    >adoption details</Text>
                    <InputController 
                        control={control}
                        errors={errors}
                        name="adoptionRequirements"
                        label='requirements'
                        placeholder="e.g., special food, etc."
                    />
                    <InputController 
                        control={control}
                        errors={errors}
                        name="adoptionReason"
                        label='reason'
                        placeholder="e.g., found a stray"
                    />
                    <View className="mb-4 flex-col items-center">
                        <Text className="label">adoption status</Text>
                        <View className="flex-row gap-2 mt-4">
                            {[
                            { value: 'available', label: 'available' },
                            { value: 'pending', label: 'pending' },
                            { value: 'adopted', label: 'adopted' },
                            ].map((option) => (
                            <ButtonComponent
                                key={option.value}
                                title={option.label}
                                onPress={() => setValue('adoptionStatus', option.value as 'available' | 'pending' | 'adopted')}
                                style={
                                adoptionStatus === option.value
                                    ? 'bg-primary flex-1'
                                    : 'bg-gray-200 flex-1'
                                }
                            />
                            ))}
                        </View>
                        {errors.adoptionStatus && (
                            <Text className="text-red-500 text-center mt-2">
                                {errors.adoptionStatus.message}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            
            <ButtonComponent 
                title={isSubmitting ? 'saving...' : submitButtonText}
                onPress={handleSubmit(onSubmit)}
                style="mt-2"
            />
            </View>
        </View>
    );
};

export default PetForm;