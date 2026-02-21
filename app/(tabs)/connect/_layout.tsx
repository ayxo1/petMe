import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

const ConnectLayout = () => {

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={
                    {
                    title: 'connect',
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    },
                    headerTintColor: Colors.primary,
                    }
                }
                
            />
        </Stack>
    )
};

export default ConnectLayout;