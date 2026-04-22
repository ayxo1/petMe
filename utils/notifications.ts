import { pb } from '@/backend/config/pocketbase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldSetBadge: true,
        shouldPlaySound: true
    }),
});

export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('push notifications permission denied');
        return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'bd449a89-ce32-4d41-a65e-f0ad8a4230e4'
    });

    const token = tokenData.data;

    await pb.collection('users').update(userId, { pushToken: token });

    return token;
};