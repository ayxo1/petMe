import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

const ConnectLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={
                    {
                    title: 'connect',
                    headerLargeTitle: true,
                    headerTransparent: true,
                    headerBlurEffect: 'regular',
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: '#e6c5c5'
                    },
                    headerSearchBarOptions: {
                    },
                    headerTintColor: Colors.primary
                    }
                }
                
            >
            </Stack.Screen>
        </Stack>
    )
};

export default ConnectLayout;