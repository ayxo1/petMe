import Colors from "@/constants/Colors";
import { FormInputData } from "@/types/components";
import { Stack } from "expo-router";

const formInputData: FormInputData[] = [
  {
    name: 'email',
    placeholder: 'enter your email',
    label: 'email',
    keyboardType: "email-address",
  },
  {
    name: 'password',
    placeholder: 'enter your password',
    label: 'password',
    keyboardType: "default",
  },
];

const ChatLayout = () => {
     
    return (
        <Stack>
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