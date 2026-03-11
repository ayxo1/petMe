import { pb } from '@/backend/config/pocketbase';
import ButtonComponent from '@/components/ButtonComponent';
import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PinEntry = () => {

    const [resendTimeout, setResendTimeout] = useState(20);
    const [pin, setPin] = useState('');
    const user = useAuthStore(state => state.user);
    const registrationState = useAuthStore(state => state.registrationState);
    const hydrateUser = useAuthStore(state => state.hydrateUser);
    const updateProfile = useAuthStore(state => state.updateProfile);
    const signOut = useAuthStore(state => state.signOut);
    const email = user?.email;

    const onSubmit = async () => {    
        try {     
            const response = await pb.send('/api/custom/verify-pin', {
                method: "POST",
                body: {
                    email: email,
                    pin: pin
                }
            });
            if (user?.regState !== 'completed') await updateProfile({ regState: 'verified' });
            Alert.alert('success!', 'email is verified!', [
                {
                    text: 'ok',
                    onPress: () => {
                        hydrateUser();
                        router.replace('/');
                    }
                }
            ]);
        } catch (error) {
            console.log('pin-entry error:', error);
            Alert.alert('incorrect or expired code, please try again');
        }
    };

    const onResend = async () => {
        setResendTimeout(19);
        try {
            await pb.send('/api/custom/resend-pin', {
                method: "POST",
                body: { email: email }
            });
        } catch (error) {
            console.log('pin-entry.tsx, onResend error:', error);
        }
    };

    useEffect(() => {
        if (resendTimeout === 0) {
            setResendTimeout(20);
            return;
        } else if (resendTimeout === 20) return;
        const resendInterval = setInterval(() => {
            setResendTimeout(prev => prev - 1);
        }, 1000);

        return () => clearInterval(resendInterval);
    }, [resendTimeout]);

  return (
    <View className='items-center gap-3'>
        <Text className=' color-secondary text-xl'>{registrationState !== 'completed' ? 'a code was sent to ' : 'verifying '}<Text className='font-bold underline decoration-gray-800 underline-offset-4'>{email}</Text></Text>
        <Text 
        className='text-center'
        >
            {registrationState !== 'completed' ? 'please enter it below' : 'click on the send code button to receive a code to your email, enter the code below:'}
        </Text>
        <TextInput 
            className='border-b-2 border-secondary p-2 w-28 text-center mb-5 text-2xl color-secondary font-bold'
            maxLength={4}
            onChangeText={val => setPin(val)}
        />
        <View className='flex-row gap-2'>
            <ButtonComponent
                title='submit'
                onPress={onSubmit}
            />
            <TouchableOpacity
                className={`border p-1 rounded-2xl px-2 bg-authPrimary/10 ${resendTimeout !== 20 && 'bg-gray-300 border-gray-300'}`}
                onPress={onResend}
                disabled={resendTimeout !== 20}
            >
                <Text className=''>{resendTimeout === 20 ? (registrationState !== 'completed' ? 'resend code' : 'send code') : `get a new code in ${resendTimeout}`}</Text>
            </TouchableOpacity>
        </View>
        {registrationState !== 'completed' && (<View className='mt-1 flex-row py-6 border-t border-t-secondary/20 items-center gap-2'>
            <Text className='font-bold color-red-500'>wrong email?</Text>
            <TouchableOpacity 
                className='border p-1 rounded-2xl px-2 border-red-400 bg-red-200/20'
                onPress={async () => {
                    await AsyncStorage.clear();
                    signOut();
                }}
            >
                <Text>re-register</Text>
            </TouchableOpacity>
        </View>)}
        {registrationState !== 'completed' && (<View className='border-t-red-500/20'>
        <TouchableOpacity 
            className='border mt-4 p-1 rounded-2xl px-2 border-red-400 bg-red-400/20'
            onPress={async () => {
                await updateProfile({ regState: 'verified' });
            }}
        >
            <Text className='font-light'>skip email verification</Text>
        </TouchableOpacity>
        </View>)}
        {registrationState !== 'completed' && (<View className='items-center max-w-96 border border-red-600 rounded-2xl p-2 gap-4'>
            <Text className='text-center font-light'>please 
                <Text className='font-bold'> double-check </Text>
                whether you entered the right email address before skipping the verification
            </Text>
            <Text className='text-center font-light'>you will be able to verify your email later in the profile settings</Text>
        </View>)}
        {registrationState === 'completed' && (
            <View className='mt-6'>
                <ButtonComponent 
                    title='back'
                    onPress={() => router.replace('/(tabs)/profile')}
                />
            </View>
        )}
    </View>
  )
};

export default PinEntry;