import { authAPI, reportsAPI } from '@/backend/config/pocketbase';
import { useState } from 'react';
import { Alert, InputAccessoryView, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import ButtonComponent from './ButtonComponent';
import InputComponent from './InputComponent';

const DeletionForm = ({ userId, toggleModal }: { userId: string; toggleModal: (isOpen: boolean) => void; }) => {

    const [deletionReason, setDeletionReason] = useState('');

    const submit = async () => {
        try {
            await reportsAPI.submitDeletionReason(`reason: ${deletionReason}, id: ${userId}`);
            await authAPI.deleteAccount(userId);
        } catch (error) {
            console.log('ProfileSettings.tsx, delete account error: ', error);
            Alert.alert('error', 'an error occurred while deleting your account, please try again or contact support');
        }
    };

    const inputAccessoryViewID = 'deletionFormDescription';

  return (
    <View
        className='max-w-[90%]'
    >
        <View>
            <Text className="text-center text-xl my-5">delete account</Text>
        </View>

        <Text className='text-black mb-4 text-center'>account deletion process is <Text className='font-bold'>irreversible, data can't be restored in the future</Text>. if you want to proceed, pleaseshare the reason and tap on the button below</Text>

        <View>
            <InputComponent
                generalStyle='w-full'
                label='please share the reason'
                placeholder='e.g., need some space on phone'
                value={deletionReason}
                onChangeText={(val) => setDeletionReason(val)}
                spellCheck
                inputAccessoryViewID={inputAccessoryViewID}
            />
        </View>

        <InputAccessoryView
            nativeID={inputAccessoryViewID}
        >
            <View 
                className='bg-white'
            >
                <TouchableOpacity 
                    className='p-1.5 items-end justify-center'
                    onPress={() => Keyboard.dismiss()}
                >
                    <Text className='mr-12 text-lg text-secondary font-semibold'>done</Text>
                </TouchableOpacity>
            </View>
        </InputAccessoryView>

        <View className='p-6'>
            <ButtonComponent
                title='delete account'
                onPress={async () => {
                    await submit();
                }}
                style='bg-black'
                textStyle='text-primary'
            />
        </View>
    </View>
  );
};

export default DeletionForm;