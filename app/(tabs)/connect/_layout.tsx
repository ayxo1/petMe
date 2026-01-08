import Modal from "@/components/Modal";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { useState } from "react";

const ConnectLayout = () => {
    const [isModal, toggleIsModal] = useState(false);

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={
                    {
                    title: 'connect',
                    headerLargeTitle: true,
                    // headerTransparent: true,
                    // headerBlurEffect: 'regular',
                    // headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    },
                    // headerSearchBarOptions: {
                    // },
                    headerTintColor: Colors.primary,
                    }
                }
                
            />
        </Stack>
    )
};

export default ConnectLayout;