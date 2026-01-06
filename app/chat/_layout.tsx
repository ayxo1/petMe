import Modal from "@/components/Modal";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ChatLayout = () => {
    const [isModal, toggleIsModal] = useState(false);

    return (
        <Stack>
            <Stack.Screen 
                name="[id]"
                options={{
                    title: '',
                    headerBackButtonDisplayMode: 'minimal',
                    contentStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerStyle: {
                        backgroundColor: Colors.secondary
                    },
                    headerTintColor: Colors.primary,
                    headerRight: () => (
                        <View>
                            <TouchableOpacity
                                onPress={() => toggleIsModal(!isModal)}
                            >
                                <Modal isOpen={isModal} toggleModal={toggleIsModal}/>
                                <Text>report</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                    headerTitle: () => (
                        <View
                            className="flex-row gap-4 pb-4 items-center"
                        >
                            <Image />
                            <Text className="text-primary text-2xl">dudeski</Text>
                        </View>
                    )
                }}
            />
        </Stack>
    )
};

export default ChatLayout;