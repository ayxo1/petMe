import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { profileSetupSchema } from '@/constants/schemas/profileSchemas';
import { useAuthStore } from '@/stores/authStore';
import { ProfileSetupFormData, User } from '@/types/auth';
import { FormInputData } from '@/types/components';
import { Coordinates, getCityFromCoordinates, getCurrentLocation } from '@/utils/location';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formInputData: FormInputData[] = [

  {
    name: 'username',
    placeholder: 'enter your username',
    label: 'username*',
    keyboardType: 'default',
  },
  {
    name: 'bio',
    placeholder: 'tell us a bit about yourself',
    label: 'bio*',
    keyboardType: "default",
  },
];

const ProfileSetup = () => {

  const { updateProfile, user, isLoading, registrationState, setRegistrationState } = useAuthStore();
  if (!user) return;
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const { initialData } = useLocalSearchParams<{ initialData: '0' | '1' }>()
  const isEditing = initialData === '1';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors, isSubmitting
    }
  } = useForm({
    resolver: yupResolver(profileSetupSchema),
    defaultValues: isEditing ? {...user} : {}
  });  

  const accountType = watch('accountType');
  const profileImages = watch('images');
  const profileCoordinates = watch('location.coordinates');

  const handleCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const coordinates = await getCurrentLocation();
      const locationData = await getCityFromCoordinates(coordinates);

      if (coordinates && locationData) {
        setValue('location', { city: locationData.city, coordinates });
      } else {
        Alert.alert('an error occurred retrieving coordinates, please try again');
        return;
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'Location permission denied') {
        Alert.alert('permission is required. location is necessary to automatically detect the city. you can also enter it manually');
      } else {
        Alert.alert('Error retrieving location, please try again');
      };
    } finally {
      setIsLoadingLocation(false);
    };
  };

  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.6
      });
      if(!result.canceled) {
          const currentImages = watch('images') || [];
          setValue('images', 
            [...currentImages, result.assets[0].uri], {
            shouldDirty: true,
            shouldValidate: true,
          });
      };
      
  };

  const removeImage = (imageToRemove: string) => {
      const updatedImages = (profileImages || []).filter(uri => uri !== imageToRemove);
      setValue('images', updatedImages, {
          shouldDirty: true,
          shouldValidate: true
      });
  };

  const submit = async (formData: ProfileSetupFormData) => {
    try {

      const userUpdate = {
        username: formData.username,
        accountType: formData.accountType,
        images: formData.images,
        location: {
          city: formData.location.city,
          coordinates: formData.location.coordinates
        },
        bio: formData.bio
      };

      const userId = user?.id;
      if(!userId) throw new Error('user not found');
      await updateProfile(userUpdate);

      if (isEditing) {
        Alert.alert(
          'success!',
          'your profile is updated',
          [{text: 'ok', onPress: () => router.replace('/')}]
        );
      } else if(formData.accountType === 'owner' || formData.accountType === 'shelter') {
        Alert.alert(
          'profile created!',
          'now you can add your pets',
          [{text: 'ok', onPress: () => router.replace('/(auth)/pet-setup')}]
        );
        if(registrationState !== 'profile_set_up') setRegistrationState('profile_set_up');

      } else {
        router.replace('/');
        setRegistrationState('completed');
      }
    } catch (error) {
      console.log(error, 'profile setup error');
      Alert.alert('error', `failed to ${isEditing ? 'update' : 'create'} profile, please try again`)
    };
  };


  return (
    <SafeAreaView className='flex-1 gap-2 mt-4'>
      <View>
        <View
          className='flex justify-center flex-row mt-5 gap-2 p-3 font-bold'
        >
          <Text className='text-secondary text-xl'>
              {isEditing ? '' : 'tell more about yourself'}
          </Text>
        </View>
        <View
          className='gap-2 rounded-lg p-5'
        >
          <View className="">

            <Text className="label">I am a...*</Text>
            <View className="flex-row gap-2 mt-2 justify-center">
              {[
                { value: 'owner', label: '🐾 Owner' },
                { value: 'seeker', label: '💝 Seeker' },
                { value: 'shelter', label: '🏠 Shelter' },
              ].filter(option => isEditing && (option.value !== 'shelter')).map((option) => (
                <ButtonComponent
                  key={option.value}
                  title={option.label}
                  onPress={() => setValue('accountType', option.value as 'owner' | 'seeker' | 'shelter')}
                  style={
                    accountType === option.value
                      ? 'bg-secondary'
                      : 'bg-gray-200'
                  }
                />
              ))}
            </View>
              {errors.accountType && (
                <Text className="text-red-500 text-center mt-2">
                  {errors.accountType.message}
                </Text>
              )}
          </View>

          <View className="mt-2 flex-row gap-2 items-center justify-center">
            {profileImages && profileImages.map(image =>                
              (
              <View key={image}>
                  <TouchableOpacity
                      className="absolute z-10 right-2 top-2"
                      onPress={() => removeImage(image)}
                  >
                      <Text className="text-xl text-red-700 border rounded-full border-red-500 bg-red-300/60 px-2">x</Text>
                  </TouchableOpacity>
                  <Image
                      source={{uri: image}}
                      style={{ 
                          width: 100,
                          height: 100,
                          borderRadius: 20
                      }}
                  />
              </View>
              )
            )}
        </View>

        {profileImages === undefined || profileImages.length < 2 
          ? (
            <TouchableOpacity 
                className="flex-row justify-start w-28 items-center"
                onPress={pickImage}
            >
              <Text className="label">add a photo*</Text>
              <Text className="text-l text-secondary">(+)</Text>
            </TouchableOpacity>
          ) 
          : (
            <Text className="label text-secondary text-center">you uploaded the maximum number of pictures</Text>
          )
        }

          <View className='h-5 mt-2'>
            {errors.images && (
              <Text className='text-red-500 text-center'>
                  {errors.images.message}
              </Text>
            )}
          </View>
          
        <View className='flex flex-row gap-5 label items-center'>
          <Text
            className='text-black font-bold'
          >{isEditing ? 'change' : 'add'} your current location</Text>
          <ButtonComponent
            title={isLoadingLocation ? 'detecting location...' : '📍'}
            onPress={handleCurrentLocation}
            isLoading={isLoadingLocation}
            style="bg-blue-200 px-2 py-2"
            textStyle="text-white"
          />
        </View>
          {isEditing && (
            <Text className='label text-secondary text-center'>(currently detected as {user.location.city})</Text>
          )}

          {profileCoordinates && !isEditing && (
            <View className="bg-green-100 p-2 rounded-lg mb-4">
              <Text className="text-green-800 text-center">
                coordinates captured
              </Text>
            </View>
          )}

          {formInputData.map((inputController, index) => (
            <Fragment key={index}>
              <InputController
                control={control}
                errors={errors}
                name={inputController.name}
                placeholder={inputController.placeholder}
                label={inputController.label}
                keyboardType={inputController?.keyboardType}
                secureTextEntry={inputController.name === 'password'}
              />
            </Fragment>
          ))}

          <ButtonComponent
          title={isSubmitting ? 'saving' : 'save'} 
          onPress={handleSubmit(submit)}
          isLoading={isLoading}
          />
          {registrationState === 'completed' && (
            <ButtonComponent 
              title='back'
              onPress={() => router.replace('/(tabs)/profile')}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileSetup;