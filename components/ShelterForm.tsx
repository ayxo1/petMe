import { shelterProfileSchema } from "@/constants/schemas/shelterProfileSchema";
import { ShelterProfile } from "@/types/auth";
import { FormInputData } from "@/types/components";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import AvatarComponent from "./AvatarComponent";
import ButtonComponent from "./ButtonComponent";
import InputController from "./controllers/InputController";

interface ShelterFormProps {
    initialData?: Partial<ShelterProfile>;
    onSubmit: (data: Partial<ShelterProfile>) => Promise<void>;
    submitButtonText?: string; 
};

const formInputData: FormInputData[] = [
    { name: 'name', label: 'shelter name*', placeholder: '' },
    { name: 'description', label: 'description*', placeholder: '', spellCheck: true },
    { name: 'address', label: 'address*', placeholder: '' },
];

const ShelterForm = ({ initialData, onSubmit, submitButtonText = 'save' }: ShelterFormProps) => {

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(shelterProfileSchema),
        defaultValues: initialData ? { ...initialData } : {}
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images']
        });
        if(!result.canceled) {
            const converted = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
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

    const shelterImage: string = watch('image');

    const removeImage = () => {
        setValue('image', '', {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    return (
        <View className="flex-1 px-5 gap-3">
            <View className="mt-2 flex-row gap-2 items-center justify-center">
                {shelterImage &&                 
                    (
                    <View key={shelterImage}>
                        <TouchableOpacity
                            className="absolute z-10 right-2 top-2"
                            onPress={removeImage}
                        >
                            <Text className="text-xl text-red-700 border rounded-full border-red-500 bg-red-300/60 px-2">x</Text>
                        </TouchableOpacity>
                        <AvatarComponent 
                            uri={shelterImage}
                            style="w-32 h-32 rounded-2xl"
                        />
                    </View>
                    )
                }
            </View>

            
            <TouchableOpacity 
                className="flex-row justify-start w-36 items-center"
                onPress={pickImage}
            >
                <Text className="label">shelter picture*</Text>
                <Text className="text-l">(+)</Text>
            </TouchableOpacity>
            

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

            <ButtonComponent 
                title={isSubmitting ? 'saving...' : submitButtonText}
                onPress={handleSubmit(onSubmit)}
                style="mt-2"
            />
        </View>
    );
};

export default ShelterForm;