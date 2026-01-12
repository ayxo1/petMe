import { pb } from "@/backend/config/pocketbase";
import { FeedProfile } from "@/types/feed";
import { Link } from "expo-router";
import React from 'react';
import { ImageSourcePropType, Pressable, Text, View } from 'react-native';

interface MatchScreenPageProps {
    modalOpen: (isOpen: boolean) => void;
    matchedProfile: FeedProfile;
    matchScreenProps: {
        matchId: string;
        username: string;
        image: string;
    }
}

const MatchScreen = ({modalOpen, matchScreenProps, matchedProfile} : MatchScreenPageProps) => {
    console.log('matchedProfile prop: ', matchScreenProps);
    
  return (
        <View className="items-center justify-center">
            
            <View className="relative left-44 bottom-28">
                <Pressable
                onPress={() => modalOpen(false)}
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
                <Link href={{
                    pathname: '/chat/[id]',
                    params: {
                        id: matchScreenProps.matchId,
                        otherUserName: matchScreenProps.username,
                        otherUserImage: matchScreenProps.image
                    }
                    }}
                    asChild
                >
                    <Pressable
                        onPress={() => modalOpen(false)}
                    >
                        <Text>message them!</Text>
                    </Pressable>
                </Link>
            </View>
            <View
            className="border rounded-xl p-2"
            >
                <Pressable
                onPress={() => modalOpen(false)}
                >
                    <Text>continue exploring</Text>
                </Pressable>
            </View>
        </View>
    </View>
  )
}

export default MatchScreen;