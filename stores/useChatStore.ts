import { pb } from "@/backend/config/pocketbase";
import * as Notifications from 'expo-notifications';
import { create } from "zustand";

interface ChatStoreState {
    hasUnreadMessages: boolean;
    unreadChatRooms: string[];
    activeChatRoomId: string | null;
    unsubscribeChat?: () => Promise<void>;

    checkUnreadStatus: (userId: string) => Promise<void>;
    checkUnreadChatRooms: (userId: string) => Promise<void>;
    subscribeToMessages: (userId: string) => Promise<() => void>;
    setActiveChatRoomId: (id: string | null) => void;
    reset: () => Promise<void>;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
    hasUnreadMessages: false,
    unreadChatRooms: [],
    unsubscribeChat: undefined,
    activeChatRoomId: null,

    checkUnreadStatus: async (userId: string) => {
        if(!pb.authStore.isValid) return;
        try {
            const result = await pb.collection('messages').getList(1, 1, {
                filter: `sender != "${userId}" && readAt = "" && (match.user1 = "${userId}" || match.user2 = "${userId}")`,
                fields: 'id'
            });
            
            set({
                hasUnreadMessages: result.totalItems > 0,
            });
        } catch (error) {
            console.log('checkUnreadStatus, useChatStore error: ', error);
        }
    },

    checkUnreadChatRooms: async (userId: string) => {
        if(!pb.authStore.isValid) return;
        try {
            const result = await pb.collection('messages').getFullList({
                filter: `sender != "${userId}" && readAt = "" && (match.user1 = "${userId}" || match.user2 = "${userId}")`,
                fields: 'match'
            });
            const unreadChatRoomIds = new Set<string>();
            result.forEach(msg => unreadChatRoomIds.add(msg.match));

            const newUnread = [...unreadChatRoomIds];
            const currentUnread = get().unreadChatRooms;
            const hasChanged = 
                newUnread.length !== currentUnread.length || 
                newUnread.some(id => !currentUnread.includes(id));

            if (hasChanged) {
                set({
                    unreadChatRooms: [...unreadChatRoomIds]
                });
                await Notifications.setBadgeCountAsync(useChatStore.getState().unreadChatRooms.length);
            }
        } catch (error) {
            console.log('useChatStore, checkUnreadChatRooms error:', error);
        }
    },

    subscribeToMessages: async (userId: string) => {
        if(!pb.authStore.isValid) return async () => {};

        if (get().unsubscribeChat) get().unsubscribeChat?.();

        const unsub = await pb.collection('messages').subscribe('*', async (e) => {
            if (e.action === 'create' && e.record.sender !== userId) {
                set({ hasUnreadMessages: true });

                const current = await Notifications.getBadgeCountAsync();
                await Notifications.setBadgeCountAsync(current + 1);
            }
        });

        set({ unsubscribeChat: unsub });
        return unsub;
    },

    setActiveChatRoomId: (id: string | null) => {
        set({
            activeChatRoomId: id
        });
    },

    reset: async () => {
        if (get().unsubscribeChat) await get().unsubscribeChat?.();

        set({ 
            hasUnreadMessages: false,
            unreadChatRooms: [],
            unsubscribeChat: undefined
        });
    }
}));