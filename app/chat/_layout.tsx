import InputController from "@/components/controllers/InputController";
import Modal from "@/components/Modal";
import { icons } from "@/constants";
import Colors from "@/constants/Colors";
import { FormInputData } from "@/types/components";
import { router, Stack } from "expo-router";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";

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