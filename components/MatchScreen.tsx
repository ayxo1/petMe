import { Link } from "expo-router";
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface MatchScreenPageProps {
    modalOpen: (isOpen: boolean) => void;
    matchScreenProps: {
        matchId: string;
        username: string;
        image: string;
        isExisting: boolean;
    }
}

const MatchScreen = ({modalOpen, matchScreenProps} : MatchScreenPageProps) => {
    
  return (
        <View className="items-center justify-center px-2.5 py-12 border border-authPrimary/30 rounded-3xl">
            
            <View>
                <View>
                    <Text className="text-2xl color-secondary text-center font-bold">{matchScreenProps.isExisting ? `looks like you already matched with ${matchScreenProps.username} over a different pet previously!` : 'it is a match!'}</Text>
                </View>
        
                <View
                    className='flex justify-end items-center flex-row mt-5 gap-2 p-3'
                >
                    <View
                        className="rounded-xl p-2 bg-secondary/50 shadow shadow-secondary/80"
                    >   
                        <Link 
                            href={'/(tabs)/connect'}
                            onPressOut={() => modalOpen(false)}
                        >
                            <Text className="text-primary">message them!</Text>
                        </Link>
                    </View>
                    <View
                        className="bg-authPrimary/40 rounded-xl p-2 shadow shadow-secondary/60"
                    >
                        <Pressable
                            onPress={() => modalOpen(false)}
                        >
                            <Text className="text-primary">continue exploring</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
    </View>
  );
};

export default MatchScreen;