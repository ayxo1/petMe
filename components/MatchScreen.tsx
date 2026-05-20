import { Link } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from 'react';
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

    const animRef = useRef<LottieView>(null);

    useEffect(() => {
        animRef.current?.play();
    }, []);
    
  return (
        <View className="items-center justify-center px-2.5 py-5 border border-authPrimary/10 rounded-3xl">
            
            <View>
                <LottieView
                ref={animRef}
                source={require('@/assets/animations/matchHeartAnim.json')}
                style={{width: 100, height: 100}}
                autoPlay
                loop
                />
            </View>

            <View>
                <View>
                    <Text className="text-2xl color-primary text-center font-bold">{matchScreenProps.isExisting ? `looks like you already matched with ${matchScreenProps.username} over a different pet previously!` : 'it is a match!'}</Text>
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