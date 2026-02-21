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
                    title: `${user?.username}`,
                    headerLargeTitle: true,
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: Colors.secondary,
                    },
                    headerTintColor: Colors.primary,
                    }
                }

            />
        </Stack>
    )
};

export default ProfileLayout;