import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

const RescueFeedLayout = () => {
     
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={
                    {
                        title: 'rescueFeed',
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

export default RescueFeedLayout;