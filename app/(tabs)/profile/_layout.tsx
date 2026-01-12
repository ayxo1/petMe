import Modal from "@/components/Modal";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { Stack } from "expo-router";
import { useState } from "react";

const ProfileLayout = () => {
    const [isModal, toggleIsModal] = useState(false);
    const user = useAuthStore(state => state.user);

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={
                    {
                    title: `${user?.username}'s profile`,
                    // headerLargeTitle: true,
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

export default ProfileLayout;