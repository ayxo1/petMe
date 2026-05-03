import { pb } from '@/backend/config/pocketbase';
import { useChatStore } from '@/stores/useChatStore';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const notificationMatchId = notification.request.content.data?.matchId;
        const currentActiveChat = useChatStore.getState().activeChatRoomId;

        const isLookingAtChat = currentActiveChat === notificationMatchId;

        return {
            shouldShowBanner: !isLookingAtChat,
            shouldShowList: !isLookingAtChat,
            shouldSetBadge: true,
            shouldPlaySound: !isLookingAtChat
        }
    },
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

export const disablePushNotifications = async (userId: string): Promise<void> => {
    await pb.collection('users').update(userId, { pushToken: '' });
};