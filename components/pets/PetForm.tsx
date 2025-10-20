import { petFormSchema } from "@/constants/schemas/petSchemas";
import { FormInputData } from "@/types/components";
import { PetFormData, PetSpecies } from "@/types/pets";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { FlatList, Switch, Text, TouchableOpacity, View } from "react-native";
import ButtonComponent from "../ButtonComponent";
import InputController from "../controllers/InputController";


interface PetFormProps {
    initialData?: Partial<PetFormData>;
    onSubmit: (data: PetFormData) => Promise<void>;
    submitButtonText?: string; 
};

const formInputData: FormInputData[] = [
    { name: 'name', label: 'pet name*', placeholder: 'e.g., mr. fluff' },
    { name: 'breed', label: 'breed (optional)', placeholder: '' },
    { name: 'age', label: 'age (years)*', placeholder: 'e.g., 3', keyboardType: 'numeric' },
    { name: 'bio', label: 'bio*', placeholder: 'describe your pet' },
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
    const isAvailableForAdoption = watch('isAvailableForAdoption');
    const adoptionStatus = watch('adoptionStatus');

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
            {/* species  */}
            <View className="mb-6">
                <Text className="label">
                    species*
                </Text>
                <View
                    className="flex-row flex-wrap gap-2 mt-2"
                >
                    <FlatList 
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="gap-x-2 pb-3"
                        data={speciesOptions}
                        keyExtractor={(item) => item.label}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                key={item.label}
                                className={`${species === item.value ? 'bg-primary' : 'bg-gray-200'} rounded-full px-4 py-3`}
                                onPress={() => setValue('species', item.value)}
                            >
                                <Text>{item.icon} {item.label}</Text>
                            </TouchableOpacity>
                        )}
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
                </View>
            {/* adoption availability toggle */}
                <View className="flex-row items-center justify-between my-4 p-4 bg-gray-100 rounded-lg gap-2">
                    <Text className="color-primary font-bold">
                        looking for a new home for your pet?
                    </Text>
                    <Switch
                        value={isAvailableForAdoption}
                        onValueChange={(val) => setValue('isAvailableForAdoption', val)}
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
                    <View className="mb-2 flex-col">
                        <Text className="label">adoption status</Text>
                        <View className="flex-row gap-2 mt-2">
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
    )

}

export default PetForm;