import { reportsAPI } from '@/backend/config/pocketbase';
import { supportForm } from '@/constants/schemas/profileSchemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import ButtonComponent from './ButtonComponent';
import InputController from './controllers/InputController';

interface SupportFormProps {
    userId: string;
    toggleModal: (isOpen: boolean) => void;
}

const SupportForm = ({ userId, toggleModal }: SupportFormProps) => {

    const [open, setOpen] = useState(false);
    const [inquiryReason, setInquiryReason] = useState(null);
    const [selectedInquiryReason, setSelectedInquiryReason] = useState([
        {label: 'suggestion', value: 'suggestion'},
        {label: 'tech issue', value: 'tech issue'},
        {label: 'report a violation', value: 'report a violation'},
        {label: 'other', value: 'other'},
    ]);

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
            reason: undefined
        }
    });

    const submit = async ({description} : {description: string}) => {
        if(!inquiryReason) return;
        try {
            // await reportsAPI.createReport(userId, reportedProfileId, reportReason, description);
            Alert.alert('report submitted', 'thanks for the info!');
            toggleModal(false);
        } catch (error) {
            console.log('report sumbit error:', error);
        }
    };

  return (
    <KeyboardAvoidingView className='w-[90%]'>
        <View>
            <Text className="text-center mb-10 text-xl text-secondary mt-10">contact support</Text>
        </View>
        <View>
            <InputController
                multiline={true}
                control={control}
                name='description'
                label='description'
                errors={errors}
                placeholder="please describe what your inquiry"
                labelStyling={'text-black'}
                spellCheck={true}
            />
        </View>
        <View>
            <View>
                <Text className='label text-black my-4 text-start'>select the reason</Text>
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
                    onChangeValue={val => {setValue('reason', val as 'suggestion')}}
                    style={errors.reason ? { borderColor: 'red', backgroundColor: '#ffffff99' } : {backgroundColor: '#ffffff99'}}
                    placeholder='select the reason'
                />
                <View className='h-5'>
                    {errors.reason && (
                        <Text className='text-red-500 text-center'>
                            {errors.reason.message}
                        </Text>
                    )}
                </View>
            </View>
            <View className='p-5'>
                <ButtonComponent
                    title='submit'
                    onPress={handleSubmit(submit)}
                    style='bg-lighterSecondary'
                    textStyle='text-secondary'
                />
            </View>
        </View>
    </KeyboardAvoidingView>
  )
}

export default SupportForm;