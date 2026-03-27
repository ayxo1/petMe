// import { LogOutButton } from '@/app/(tabs)/profile';
import { pb } from '@/backend/config/pocketbase';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useFeedStore } from '@/stores/useFeedStore';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { speciesOptions } from './pets/PetForm';

const ProfileSettings = ({ signOut, LogOutButton, modalOpen }: { signOut: () => void, LogOutButton: () => React.JSX.Element, modalOpen: boolean; }) => {
    
    const user = useAuthStore(state => state.user);
    if (!user) return;
    const { fetchProfileBatch, reset } = useFeedStore();
    const updateProfile = useAuthStore(state => state.updateProfile);
    const preferences = user.preferences;

    const [distance, setDistatance] = useState(0);
    const distanceRef = useRef(distance);
    distanceRef.current = distance;

    const [preferredSpecies, setPreferredSpecies] = useState<string[]>([]);
    const preferredSpeciesRef = useRef(preferredSpecies);
    preferredSpeciesRef.current = preferredSpecies;    

    const [showRescuePets, setShowRescuePets] = useState(true);
    const showRescueRef = useRef(showRescuePets);
    showRescueRef.current = showRescuePets;

    const [showShelterPets, setShowShelterPets] = useState(true);
    const showShelterRef = useRef(showShelterPets);
    showShelterRef.current = showShelterPets;

    const [showSeekers, setShowSeekers] = useState(true);
    const showSeekersRef = useRef(showSeekers);
    showSeekersRef.current = showSeekers;

    const [emailForm, setEmailForm] = useState({ newEmail: '', isLoading: false });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', isLoading: false });

    const onEmailChange = async () => {
        if (emailForm.newEmail && emailForm.newEmail !== user.email) {
            try {
                setEmailForm({  ...emailForm, isLoading: true });
                await pb.collection('users').requestEmailChange(emailForm.newEmail);
                Alert.alert('check your email', `a confirmation link was sent to your new address (${emailForm.newEmail})`);
            } catch (error) {
                console.log('profileSettings, onEmailChange error:', error);
                Alert.alert('error', 'an error occurred setting a new email, please try again');
            } finally {
                setEmailForm({  ...emailForm, isLoading: false });
            }
        } else if (emailForm.newEmail === user.email) {
            Alert.alert('the new email is identical to the old one', 'please check the new email address');
        } else Alert.alert('the new email field is empty', 'please type in the new email address that you want to set');
    };

    const onPasswordChange = async () => {
        if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.currentPassword) {
            try {
                setPasswordForm({  ...passwordForm, isLoading: true });
                await pb.collection('users').update(user.id, {
                    oldPassword: passwordForm.currentPassword,
                    password: passwordForm.newPassword,
                    passwordConfirm: passwordForm.newPassword
                });
                Alert.alert('success!', 'your password is updated. you will be redirected to re-login', 
                    [
                        {
                            text: 'ok',
                            onPress: () => signOut()
                        }
                    ]
                );
            } catch (error) {
                console.log('profileSettings, onPasswordChange error:', error);
                Alert.alert('error', 'an error occurred setting a new password. make sure your current password is correct and the new one is different from the current one');
            } finally {
                setPasswordForm({  ...passwordForm, isLoading: false });
            }
        } else if (passwordForm.newPassword === passwordForm.currentPassword) Alert.alert('error', 'the password you are trying to set is identical to the one you entered as the current password');
    };

    useEffect(() => {
        setDistatance(preferences.searchDistance);
        setShowRescuePets(preferences.showRescuePets);
        setShowShelterPets(preferences.showShelterPets);
        setPreferredSpecies(preferences.preferredSpecies)
        setShowSeekers(preferences.showSeekers);
        
        const saveChanges = async () => {
            const updatedPreferences = {
                ...preferences,
                searchDistance: distanceRef.current,
                showRescuePets: showRescueRef.current,
                showShelterPets: showShelterRef.current,
                preferredSpecies: preferredSpeciesRef.current,
                showSeekers: showSeekersRef.current
            };
            if (
                preferences.searchDistance !== distanceRef.current ||
                preferences.showRescuePets !== showRescueRef.current ||
                preferences.showShelterPets !== showShelterRef.current ||
                preferences.preferredSpecies !== preferredSpeciesRef.current ||
                preferences.showSeekers !== showSeekersRef.current
            ) {
                try {
                    await updateProfile({ preferences: updatedPreferences });
                    reset();
                    await fetchProfileBatch();
                } catch (error) {
                    console.log('profileSettings, saveChanges error:', error);
                }
            }
        }
        return () => { 
            saveChanges();
        };
    }, []);

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
                                    value={distance}
                                />
                            </View>
                        </View>
                        <View>
                            <Text className='font-bold mb-2'>search preferences:</Text>
                            <View className='p-2 flex-row justify-between items-center'>
                                <Text className='font-light text-secondary'>show pets that look for a new home:</Text>
                                <Switch 
                                    value={showRescuePets}
                                    onValueChange={(val) => setShowRescuePets(val)}
                                    trackColor={{ true: Colors.secondary, false: Colors.lighterSecondary}}
                                    ios_backgroundColor={Colors.lighterSecondary}
                                />
                            </View>
                            <View className='p-2 flex-row justify-between items-center'>
                                <Text className='font-light text-secondary'>show shelter pets:</Text>
                                <Switch 
                                    value={showShelterPets}
                                    onValueChange={(val) => setShowShelterPets(val)}
                                    trackColor={{ true: Colors.secondary, false: Colors.lighterSecondary}}
                                    ios_backgroundColor={Colors.lighterSecondary}
                                />
                            </View>
                            {user.accountType == 'owner' && (
                                <View className='p-2 flex-row justify-between items-center'>
                                    <Text className='font-light text-secondary'>show seeker profiles:</Text>
                                    <Switch
                                        value={showSeekers}
                                        onValueChange={(val) => setShowSeekers(val)}
                                        trackColor={{ true: Colors.secondary, false: Colors.lighterSecondary}}
                                        ios_backgroundColor={Colors.lighterSecondary}
                                    />
                                </View>
                            )}
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
                                                className={`${preferredSpecies.includes(item.value) ? 'bg-secondary' : 'bg-lighterSecondary'} rounded-full px-4 py-3`}
                                                onPress={() => setPreferredSpecies(prev => {
                                                    return prev.includes(item.value) ? prev.filter(species => species !== item.value) : [...prev, item.value]
                                                })}
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
                                value={emailForm.newEmail}
                                onChangeText={(val) => setEmailForm({ ...emailForm, newEmail: val })}
                                keyboardType='email-address'
                            />
                        </View>
                        <TouchableOpacity
                            className='py-1 px-2 rounded-2xl bg-secondary w-40 items-center'
                            onPress={onEmailChange}
                            disabled={emailForm.isLoading}
                        >
                            <Text className='text-white'>{emailForm.isLoading ? (
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
                            value={passwordForm.currentPassword}
                            onChangeText={(val) => setPasswordForm({ ...passwordForm, currentPassword: val })}
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
                            value={passwordForm.newPassword}
                            onChangeText={(val) => setPasswordForm({ ...passwordForm, newPassword: val })}
                            secureTextEntry
                            textContentType='oneTimeCode'
                        />
                    </View>
                    <TouchableOpacity
                        className={`bg-secondary py-1 px-2 rounded-2xl mt-6 w-48 items-center ${!pb.authStore.record?.verified && 'bg-gray-500/50'}`}
                        disabled={!pb.authStore.record?.verified && !passwordForm.isLoading}
                        onPress={onPasswordChange}
                    >
                        <Text className={`${!pb.authStore.record?.verified ? 'text-gray-400' : 'text-white'}`}>{passwordForm.isLoading 
                        ? 
                            (<ActivityIndicator size='small' color={Colors.lighterSecondary}/>) 
                        :   'confirm new password'}
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            <View className='flex-1 justify-end mb-20 border-t py-4'>
                <LogOutButton />
            </View>
        </Pressable>
    </ScrollView>
  );
};

export default ProfileSettings;