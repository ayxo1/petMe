import { FeedProfile } from "@/types/feed";


interface LikesStoreState {
    incomingLikes: FeedProfile[];
    unreadCount: number;

    fetchIncomingLikesProfiles: () => Promise<void>;
    subscribeToLikesCount: () => Promise<void>;
}

