import Modal from "@/components/Modal";
import { icons } from "@/constants";
import Colors from "@/constants/Colors";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ChatLayout = () => {
    const [isModal, toggleIsModal] = useState(false);

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
                    headerRight: () => (
                        <View>
                            <TouchableOpacity
                                onPress={() => toggleIsModal(!isModal)}
                            >
                                <Modal isOpen={isModal} toggleModal={toggleIsModal}/>
                                <Text className="text-red-900">report</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                        >
                            <Image
                                source={icons.backIcon}
                                className='size-9'
                                resizeMode='contain'
                                tintColor={Colors.primary}
                            />
                        </TouchableOpacity>
                    )
                }}
            />
        </Stack>
    )
};

export default ChatLayout;