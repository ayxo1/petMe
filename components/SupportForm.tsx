import { pb } from '@/backend/config/pocketbase';
import { supportForm } from '@/constants/schemas/profileSchemas';
import { useAuthStore } from '@/stores/authStore';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, InputAccessoryView, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import ButtonComponent from './ButtonComponent';
import InputController from './controllers/InputController';

interface SupportFormProps {
    userId: string;
    toggleModal: (isOpen: boolean) => void;
}

const SupportForm = ({ userId, toggleModal }: SupportFormProps) => {

    const user = useAuthStore(state => state.user);
    const [open, setOpen] = useState(false);
    const [inquiryReason, setInquiryReason] = useState(null);
    const [selectedInquiryReason, setSelectedInquiryReason] = useState([
        {label: 'suggestion', value: 'suggestion'},
        {label: 'tech issue', value: 'tech issue'},
        {label: 'report a violation', value: 'report a violation'},
        {label: 'other', value: 'other'},
    ]);
    const inputAccessoryViewID = 'supportFormDescription';

    const {
        control,
        handleSubmit,
        setValue,
        formState: {
        errors
        }
    } = useForm({
        resolver: yupResolver(supportForm),
        defaultValues: {
            inquiryReason: undefined
        }
    });

    const submit = async ({description, inquiryReason } : { description: string; inquiryReason: string; }) => {
        if(!inquiryReason) return;
        try {
            if (user) {                
                await pb.collection('support').create({
                    submitter: userId,
                    description,
                    inquiryReason
                });
            }
            pb.send("/api/send-mail", {
                method: "POST",
                body: {
                    inquiryReason,
                    description
                }
            });
            Alert.alert('support inquiry submitted', 'thanks for the info!');
            toggleModal(false);
        } catch (error) {
            console.log('SupportForm.tsx support sumbit error:', error);
        }
    };

  return (
    <View
        className='max-w-[90%]'
    >
        <View>
            <Text className="text-center text-xl text-secondary my-5">contact support</Text>
        </View>
        
        <View>
            <InputController
                multiline
                control={control}
                name='description'
                label='description'
                errors={errors}
                placeholder="please describe what your inquiry"
                labelStyling={'text-secondary'}
                spellCheck
                inputAccessoryViewID={inputAccessoryViewID}
            />
        </View>
                    
        <InputAccessoryView 
            nativeID={inputAccessoryViewID}
        >
            <View 
                className='bg-white/80'
            >
                <TouchableOpacity 
                    className='p-1.5 items-end justify-center'
                    onPress={() => Keyboard.dismiss()}
                >
                    <Text className='mr-12 text-lg text-secondary font-semibold'>done</Text>
                </TouchableOpacity>
            </View>
        </InputAccessoryView>
        
        <View>
            <View>
                <Text className='label my-2 text-secondary'>select the reason</Text>
            </View>
            <View className='justify-center'>
                <DropDownPicker
                    open={open}
                    value={inquiryReason}
                    items={selectedInquiryReason}
                    setOpen={setOpen}
                    setValue={setInquiryReason} 
                    setItems={setSelectedInquiryReason}
                    multiple={false}
                    mode="BADGE"
                    onChangeValue={val => {setValue('inquiryReason', val as 'suggestion')}}
                    style={errors.inquiryReason ? { borderColor: 'red', backgroundColor: '#ffffff99' } : {backgroundColor: '#fffff'}}
                    placeholder='select the reason'
                />
                <View className='h-5'>
                    {errors.inquiryReason && (
                        <Text className='text-red-500 text-center'>
                            {errors.inquiryReason.message}
                        </Text>
                    )}
                </View>
            </View>
        </View>


        <View className='p-6'>
            <ButtonComponent
                title='submit'
                onPress={handleSubmit(submit)}
                style='bg-lighterSecondary'
                textStyle='text-secondary'
            />
        </View>
    </View>
  );
};

export default SupportForm;