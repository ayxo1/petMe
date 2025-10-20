import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { profileSetupSchema } from '@/constants/schemas/profileSchemas';
import { useAuthStore } from '@/stores/authStore';
import { ProfileSetupFormData, ProfileSetupSubmitData } from '@/types/auth';
import { FormInputData } from '@/types/components';
import { Coordinates, getCityFromCoordinates, getCurrentLocation } from '@/utils/location';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';

const formInputData: FormInputData[] = [
  {
    name: 'city',
    placeholder: 'select your city',
    label: 'city*',
    keyboardType: 'default',
  },
  {
    name: 'bio',
    placeholder: 'tell us a bit about yourself',
    label: 'bio',
    keyboardType: "default",
  },
];

const ProfileSetup = () => {

  const { updateProfile, user, isLoading, setRegistrationState } = useAuthStore();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors, isSubmitting
    }
  } = useForm({
    resolver: yupResolver(profileSetupSchema)
  });

  const accountType = watch('accountType');
  const city = watch('city');

  const handleCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const coordinates = await getCurrentLocation();
      setCoordinates(coordinates);

      const locationData = await getCityFromCoordinates(coordinates);

      if(locationData) {
        setValue('city', locationData.city);
        Alert.alert(`location detected: ${locationData.city}`);
      } else {
        Alert.alert('coordinates are retrieved, however, the city is not determined. Please enter it manually');
      };

    } catch (error) {
      if (error instanceof Error && error.message === 'Location permission denied') {
        Alert.alert('permission is required. location is necessary to automatically detect the city. you can also enter it manually');
      } else {
        Alert.alert('Error retrieving location, please enter the city manually');
      };
    } finally {
      setRegistrationState('profile_set_up');
      setIsLoadingLocation(false);
    };
  };

  const submit = async (formData: ProfileSetupFormData) => {
    try {
      const submitData: ProfileSetupSubmitData = {
        ...formData,
        coordinates
      };

      const userUpdate = {
        accountType: submitData.accountType,
        location: {
          city: submitData.city,
          coordinates: submitData.coordinates
        },
        bio: submitData.bio
      };

      const userId = user?.id;
      if(!userId) throw new Error('user not found');
      await updateProfile(userUpdate);

      if(submitData.accountType === 'owner' || submitData.accountType === 'shelter') {
        Alert.alert(
          'profile created!',
          'now you can add your pets',
          [{text: 'ok', onPress: () => router.replace('/(auth)/pet-setup')}]
        );
      } else router.replace('/');
    } catch (error) {
      console.log(error, 'profile setup error');
      Alert.alert('error', 'failed to create profile, please try again')
    }    
    
  };

  return (
    <View>
        <View
            className='flex justify-center flex-row mt-5 gap-2 p-3 font-bold'
        >
            <Text>
                tell more about yourself
            </Text>
        </View>
      <View
        className='gap-3 rounded-lg p-5'
      >
        <View className="">

          <Text className="label">I am a...</Text>
          <View className="flex-row gap-2 mt-2">
            {[
              { value: 'owner', label: '🐾 Pet Owner' },
              { value: 'seeker', label: '💝 Pet Seeker' },
              { value: 'shelter', label: '🏠 Shelter' },
            ].map((option) => (
              <ButtonComponent
                key={option.value}
                title={option.label}
                onPress={() => setValue('accountType', option.value as 'owner' | 'seeker' | 'shelter')}
                style={
                  accountType === option.value
                    ? 'bg-primary flex-1'
                    : 'bg-gray-200 flex-1'
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
        
        <View className='flex flex-row gap-5 p-2 items-center'>
          <Text
            className='text-primary'
          >add current location</Text>
          <ButtonComponent
            title={isLoadingLocation ? 'detecting location...' : '📍'}
            onPress={handleCurrentLocation}
            isLoading={isLoadingLocation}
            style="bg-blue-200 w-[12%]"
            textStyle="text-white"
            disabled={coordinates ? true : false}
          />
        </View>
          {coordinates && (
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
      </View>
    </View>
  )
}

export default ProfileSetup;