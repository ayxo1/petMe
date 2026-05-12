import { pb } from '@/backend/config/pocketbase';
import EventForm from '@/components/EventForm';
import { PBEventPage } from '@/types/components';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EventSetup = () => {

  const { id, initialData } = useLocalSearchParams<{ id: string, initialData: '0' | '1' }>();
  const isEditing = initialData === '1';
  const [eventToEdit, setEventToEdit] = useState<PBEventPage>();
  const [isLoading, setIsLoading] = useState(false);
  //   const petToEdit = pets.find(pet => pet.id === id);
  //   const isEditing = !!petToEdit;

  useEffect(() => {
    const fetchEventData = async () => {
        if (id && isEditing) {
            setIsLoading(true);
            try {
                const result: PBEventPage = await pb.collection('events').getOne(id);
                const convertedEvent = {
                    ...result,
                    image: result.image ? `${pb.baseURL}/api/files/events/${result.id}/${result.image}` : ''
                };
                setEventToEdit(convertedEvent);
            } catch (error) {
                console.log('event-setup.tsx error:', error);   
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchEventData();
  }, []);

  return (
    <SafeAreaView 
        className='flex-1 gap-2 mt-4'
    >
        {isLoading && 
            <SafeAreaView className="flex-1 flex-row gap-2 items-center justify-center absolute top-48 left-0 right-0">
                <ActivityIndicator size="small" className='color-gray-600/60' />
                <Text className="text-2xl text-gray-600/60 text-center max-w-96">loading</Text>
            </SafeAreaView>
        }
        
        {!isLoading ?
        <>
        {!isEditing ? <Text className='font-bold text-xl text-secondary text-center mb-4'>
            {/* {isEditing ? `editing ${petToEdit.name}'s profile` : 'add a new pet'} */}
            add a new event
        </Text> : null}

        <ScrollView 
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ flexGrow: 1 }}
            automaticallyAdjustKeyboardInsets={true}
        >
            <EventForm
                initialData={(isEditing && eventToEdit) ? {...eventToEdit} : undefined}
                // onSubmit={onSubmit}
            />
        </ScrollView>
        </> : null}
    </SafeAreaView>
  );
};

export default EventSetup;