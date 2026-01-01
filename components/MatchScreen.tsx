import { Link } from "expo-router";
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface MatchScreenProps {
    modalClose: (isOpen: boolean) => void;
}

const MatchScreen = ({modalClose} : MatchScreenProps) => {
  return (
        <View className="items-center justify-center">
            
            <View className="relative left-44 bottom-28">
                <Pressable
                onPress={() => modalClose(false)}
                >
                <Text className="text-3xl">x</Text>
                </Pressable>
            </View>
            
        <View>
            <Text className="text-3xl color-slate-800">it's aaaa maaaatch!!</Text>
        </View>
    
        <View
            className='flex justify-end items-baseline flex-row mt-5 gap-2 p-3'
            >
            <View
            className="border rounded-xl p-2"
            >
                <Link 
                    href={'/(tabs)/connect'}
                    className='text-black'
                >
                    message them!
                </Link>
            </View>
            <View
            className="border rounded-xl p-2"
            >
                <Pressable
                onPress={() => modalClose(false)}
                >
                    <Text>continue exploring</Text>
                </Pressable>
            </View>
        </View>
    </View>
  )
}

export default MatchScreen;