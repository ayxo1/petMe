import { LogOutButton } from '@/app/(tabs)/profile';
import { pb } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { speciesOptions } from './pets/PetForm';

const ProfileSettings = ({ signOut, modalOpen }: { signOut: () => void, modalOpen: boolean; }) => {
    
    const user = useAuthStore(state => state.user);
    if (!user) return;
    
    const [distance, setDistatance] = useState(0);
    const [newEmail, setNewEmail] = useState('');
    const [emailChangeLoader, setEmailChangeLoader] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordChangeLoader, setPasswordChangeLoader] = useState(false);

    const onEmailChange = async () => {
        if (newEmail && newEmail !== user.email) {
            try {
                setEmailChangeLoader(true);
                await pb.collection('users').requestEmailChange(newEmail);
                Alert.alert('check your email', `a confirmation link was sent to your new address (${newEmail})`);
            } catch (error) {
                console.log('profileSettings, onEmailChange error:', error);
                Alert.alert('error', 'an error occurred setting a new email, please try again');
            } finally {
                setEmailChangeLoader(false);
            }
        } else if (newEmail === user.email) {
            Alert.alert('the new email is identical to the old one', 'please check the new email address');
        } else Alert.alert('the new email field is empty', 'please type in the new email address that you want to set');
    };

    const onPasswordChange = async () => {
        if (newPassword && newPassword !== currentPassword) {
            try {
                setPasswordChangeLoader(true);
                await pb.collection('users').update(user.id, {
                    oldPassword: currentPassword,
                    password: newPassword,
                    passwordConfirm: newPassword
                });
                Alert.alert('success!', 'your password is updated');
            } catch (error) {
                console.log('profileSettings, onPasswordChange error:', error);
                Alert.alert('error', 'an error occurred setting a new password. make sure your current password is correct and the new one is different from the current one');
            } finally {
                setPasswordChangeLoader(false);
            }
        } else if (newPassword === currentPassword) Alert.alert('error', 'the password you are trying to set is identical to the one you entered as the current password');
    };

    const onDistanceChange = async () => {
        
    };

  return (
    <ScrollView
        className='p-2'
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps='handled'
    >
        <Pressable className='flex-1 w-96 gap-4'
            onPress={() => Keyboard.dismiss()}
        >
            {/* email verification */}
            {!pb.authStore.record?.verified && (
            <View className='bg-primary/90 shadow shadow-secondary/30 rounded-2xl'>
                <View className='gap-2 p-3 border border-secondary rounded-2xl'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-red-500 font-bold'>your email is not verified*</Text>
                        <TouchableOpacity
                        className='border border-secondary py-1 px-2 rounded-2xl bg-red-300/20'
                        onPress={() => router.replace('/(auth)/pin-entry')}
                        >
                        <Text className='text-secondary'>verify your email</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            )}

            {/* profile feed settings */}
            <View className='bg-primary/90 shadow shadow-secondary/30 rounded-2xl'>
                <View className='border p-3 rounded-2xl border-secondary'>
                    <Text className='font-bold text-secondary mb-4 text-center'>profile feed settings</Text>
                    <View className='p-1 gap-2'>
                        <View>
                            <View className='flex-row justify-between'>
                                <Text className='font-bold'>search distance: </Text>
                                <Text className='text-secondary'>{distance} km</Text>
                            </View>
                            
                            <View>
                                <Slider 
                                    minimumValue={0}
                                    maximumValue={1000}
                                    step={1}
                                    minimumTrackTintColor={Colors.secondary}
                                    onValueChange={(val) => setDistatance(val)}
                                />
                            </View>
                        </View>
                        <View>
                            <Text className='font-bold mb-2'>search preferences:</Text>
                            <View className='p-2 flex-row justify-between items-center'>
                                <Text className='font-light text-secondary'>show pets that look for a new home:</Text>
                                <Switch />
                            </View>
                            <View className='p-2 flex-row justify-between items-center'>
                                <Text className='font-light text-secondary'>show shelter pets:</Text>
                                <Switch />
                            </View>
                            <View className='p-2 justify-between mt-2'>
                                <Text className='font-light text-secondary mb-3'>mostly interested in:</Text>
                                <View
                                    className="flex-row flex-wrap gap-2"
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
                                                className={`bg-gray-200 rounded-full px-4 py-3`}
                                            >
                                                <Text>{item.icon} {item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* email settings */}
            <View className='bg-primary/90 shadow shadow-secondary/30 rounded-2xl'>
                <View className='border p-3 rounded-2xl border-secondary gap-2'>
                    <Text className='font-bold text-secondary mb-2 text-center'>email settings</Text>
                        <View className='items-center'>
                            <Text className='text-secondary mb-4 font-light text-center'>your current email:
                                <Text className='font-bold'> {user.email}</Text>
                            </Text>
                        </View>

                    <View className='flex-row items-center justify-between'>
                        <View>
                            <Text className='text-secondary mb-4 font-light'>enter your new email:</Text>
                            <TextInput 
                                className='border-b font-light w-44 p-1'
                                placeholder='your new email'
                                placeholderTextColor={'gray'}
                                value={newEmail}
                                onChangeText={(val) => setNewEmail(val)}
                                keyboardType='email-address'
                            />
                        </View>
                        <TouchableOpacity
                            className='py-1 px-2 rounded-2xl bg-secondary w-40 items-center'
                            onPress={onEmailChange}
                            disabled={emailChangeLoader}
                        >
                            <Text className='text-white'>{emailChangeLoader ? (
                                <ActivityIndicator size='small' color={Colors.lighterSecondary}/>
                            ) : 'confirm your email'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            {/* password settings */}
            <View className='bg-primary/90 shadow shadow-secondary/30 rounded-2xl'>
                <View className='gap-2 border p-3 rounded-2xl border-secondary'>
                    <Text className='font-bold text-secondary mb-2 text-center'>change password</Text>
                    {!pb.authStore.record?.verified && (<Text className='font-light text-center text-red-500/80'>*to be able to change your password, please verify your email first</Text>)}
                    <View className='items-center justify-between'>
                    <View className='mt-4'>
                        <Text className='text-secondary mb-4 font-light'>enter your current password:</Text>
                        <TextInput 
                            className='border-b font-light w-52 p-1'
                            placeholder='your current password'
                            placeholderTextColor={'gray'}
                            value={currentPassword}
                            onChangeText={(val) => setCurrentPassword(val)}
                            secureTextEntry
                            textContentType='oneTimeCode'
                        />
                    </View>
                    </View>
                    <View className='items-center justify-between'>
                    <View className='mt-4'>
                        <Text className='text-secondary mb-4 font-light'>enter your new password:</Text>
                        <TextInput 
                            className='border-b font-light w-52 p-1'
                            placeholder='your new password'
                            placeholderTextColor={'gray'}
                            value={newPassword}
                            onChangeText={(val) => setNewPassword(val)}
                            secureTextEntry
                            textContentType='oneTimeCode'
                        />
                    </View>
                    <TouchableOpacity
                        className={`bg-secondary py-1 px-2 rounded-2xl mt-6 w-48 items-center ${!pb.authStore.record?.verified && 'bg-gray-500/50'}`}
                        disabled={!pb.authStore.record?.verified && !passwordChangeLoader}
                        onPress={onPasswordChange}
                    >
                        <Text className={`${!pb.authStore.record?.verified ? 'text-gray-400' : 'text-white'}`}>{passwordChangeLoader 
                        ? 
                            (<ActivityIndicator size='small' color={Colors.lighterSecondary}/>) 
                        :   'confirm new password'}
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            <View className='flex-1 justify-end mb-20 border-t py-4'>
                <LogOutButton signOut={signOut}/>
            </View>
        </Pressable>
    </ScrollView>
  );
};

export default ProfileSettings;