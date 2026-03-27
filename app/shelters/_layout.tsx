import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

const ChatLayout = () => {
     
    return (
        <Stack
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen 
                name="[id]"
                options={{
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    },
                    headerTintColor: Colors.primary,
                }}
            />
        </Stack>
    )
};

export default ChatLayout;