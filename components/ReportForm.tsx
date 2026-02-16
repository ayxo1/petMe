import { reportsAPI } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { reportProfile } from '@/constants/schemas/profileSchemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import ButtonComponent from './ButtonComponent';
import InputController from './controllers/InputController';

interface ReportFormProps {
    userId: string; 
    reportedProfileName: string;
    reportedProfileId: string;
    toggleModal: (isOpen: boolean) => void;
}

const ReportForm = ({ userId, reportedProfileName, reportedProfileId, toggleModal }: ReportFormProps) => {

    const [open, setOpen] = useState(false);
    const [reportReason, setReportReason] = useState(null);
    const [selectedReportReason, setSelectedReportReason] = useState([
    {label: 'inappropriate', value: 'inappropriate'},
    {label: 'fake', value: 'fake'},
    {label: 'spam', value: 'spam'},
    {label: 'harassment', value: 'harassment'},
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
        resolver: yupResolver(reportProfile),
        defaultValues: {
            reason: undefined
        }
    });

    const submit = async ({description} : {description: string}) => {
        if(!reportReason) return;
        try {
            await reportsAPI.createReport(userId, reportedProfileId, reportReason, description);
            Alert.alert('report submitted', 'thanks for the info!');
            toggleModal(false);
        } catch (error) {
            console.log('report sumbit error:', error);
        }
    };

  return (
    <KeyboardAvoidingView className='w-96'>
        <View>
            <Text className="text-center mb-10 text-xl text-red-900 mt-10">report {reportedProfileName}</Text>
        </View>
        <View>
            <InputController
                multiline={true}
                control={control}
                name='description'
                label='description'
                errors={errors}
                placeholder="please describe what you noticed"
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
                    value={reportReason}
                    items={selectedReportReason}
                    setOpen={setOpen}
                    setValue={setReportReason} 
                    setItems={setSelectedReportReason}
                    multiple={false}
                    mode="BADGE"
                    onChangeValue={val => {setValue('reason', val as 'inappropriate' | 'fake' | 'spam' | 'harassment' | 'other')}}
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
                style='bg-red-900'
                textStyle='text-primary'
                />
            </View>
        </View>
    </KeyboardAvoidingView>
  )
}

export default ReportForm;