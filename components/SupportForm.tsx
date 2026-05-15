import { pb } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { supportForm } from '@/constants/schemas/profileSchemas';
import { useAuthStore } from '@/stores/authStore';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, InputAccessoryView, KeyboardAvoidingView, Text, View } from 'react-native';
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
    const inputAccessoryViewID = 'uniqueID';

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
    <KeyboardAvoidingView
        className='max-w-[90%]'
    >
        <View>
            <Text className="text-center mb-5 text-xl text-secondary mt-10">contact support</Text>
        </View>
        
        <View>
            <View>
                <Text className='label my-4 text-secondary'>select the reason</Text>
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
                    style={errors.inquiryReason ? { borderColor: 'red', backgroundColor: '#ffffff99' } : {backgroundColor: Colors.lighterSecondary}}
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
            <View className='mb-5 items-end mr-11'>
                <Button
                    color={Colors.secondary}
                    title='submit'
                />
            </View>
        </InputAccessoryView>

        <View className='p-6'>
            <ButtonComponent
                title='submit'
                onPress={handleSubmit(submit)}
                style='bg-lighterSecondary'
                textStyle='text-secondary'
            />
        </View>
    </KeyboardAvoidingView>
  );
};

export default SupportForm;