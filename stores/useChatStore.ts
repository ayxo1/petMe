import { pb } from "@/backend/config/pocketbase";
import { create } from "zustand";


interface ChatStoreState {
    hasUnreadMessages: boolean;
    unreadChatRooms: string[];
    unsubscribeChat?: () => Promise<void>;

    checkUnreadStatus: (userId: string) => Promise<void>;
    checkUnreadChatRooms: (userId: string) => Promise<void>;
    subscribeToMessages: (userId: string) => Promise<() => void>;
    reset: () => Promise<void>;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
    hasUnreadMessages: false,
    unreadChatRooms: [],
    unsubscribeChat: undefined,

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
            }
        } catch (error) {
            console.log('useChatStore, checkUnreadChatRooms error:', error);
        }
    },

    subscribeToMessages: async (userId: string) => {
        if(!pb.authStore.isValid) return async () => {};

        if (get().unsubscribeChat) get().unsubscribeChat?.();
        // await pb.collection('messages').unsubscribe('*');

        const unsub = await pb.collection('messages').subscribe('*', e => {
            if (e.action === 'create' && e.record.sender !== userId) {
                set({ hasUnreadMessages: true });
            }
        });

        set({ unsubscribeChat: unsub });
        return unsub;
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