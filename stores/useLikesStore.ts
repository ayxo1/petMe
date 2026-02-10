import { pb } from "@/backend/config/pocketbase";
import { FeedProfile, IncomingLikeFeedProfile } from "@/types/feed";
import { PBFeedRecord, PBIncomingLikeProfile } from "@/types/pbTypes";
import { create } from "zustand";

interface LikesStoreState {
    incomingLikes: IncomingLikeFeedProfile[];
    unreadCount: number;
    isLoading: boolean;
    unsubscribeLikes?: () => Promise<void>;

    fetchIncomingLikesProfiles: () => Promise<void>;
    subscribeToLikesCount: (userId: string) => Promise<() => void>;
    removeLike: (profileId: string) => void;
    reset: () => Promise<void>;
}

const convertPBIncomingLikeProfile = (record: PBIncomingLikeProfile): IncomingLikeFeedProfile => {    
    const collectionName = record.type === 'pet' ? 'pets' : 'users';
    let imageUrls: string[] = [];
    imageUrls = record.images.map(filename => `${pb.baseURL}/api/files/${collectionName}/${record.id}/${filename}`);

    return {
        id: record.id,
        name: record.name,
        type: record.type,
        ownerId: record.ownerId,
        species: record.species,
        breed: record.breed,
        age: record.age,
        bio: record.bio,
        images: imageUrls,
        ownerName: record.ownerName,
        ownerImage: record.ownerImage,
        likedTarget: record.likedTarget,
        likedTargetType: record.likedTargetType,
        likedTargetName: record.likedTargetName,
        isAvailableForAdoption: record.isAvailableForAdoption,
        adoptionStatus: record.adoptionStatus,
        adoptionDetails: record.isAvailableForAdoption ? {
            requirements: record.adoptionRequirements,
            reason: record.adoptionReason
        } : undefined,
        createdAt: record.created,
        updatedAt: record.updated
    };
};

export const useLikesStore = create<LikesStoreState>(
    (set, get) => ({
        incomingLikes: [],
        unreadCount: 0,
        isLoading: false,
        unsubscribeLikes: undefined,

        fetchIncomingLikesProfiles: async () => {
            if(!pb.authStore.isValid) return;
            
            set({ isLoading: true });

            try {
                const result = await pb.send<{ items: PBIncomingLikeProfile[] }>("/api/likes", {});

                const profiles = result.items.map(convertPBIncomingLikeProfile);

                const uniqueProfiles = Array.from(
                    new Map(profiles.map(item => [item.id, item])).values()
                );

                set({
                    incomingLikes: uniqueProfiles,
                    unreadCount: uniqueProfiles.length,
                    isLoading: false
                });

                // console.log('likesStorelog:', get().incomingLikes);
                

            } catch (error) {
                console.log('error fetching incomingLikesProfiles: ', error);
                set({ isLoading: false });
                throw error;
            }
        },
        removeLike: (id) => {
            const currentLikes = get().incomingLikes;
            const newLikes = currentLikes.filter(like => like.id !== id);
            
            set({
                incomingLikes: newLikes,
                unreadCount: newLikes.length
            });
        },

        subscribeToLikesCount: async (userId) => {
            if (!pb.authStore.isValid) return async () => {};

            if (get().unsubscribeLikes) get().unsubscribeLikes?.();

            await pb.collection('swipes').unsubscribe('*');

            const unsub = await pb.collection('swipes').subscribe('*', async e => {
              if (e.action === 'create' && e.record.targetOwnerId === userId && e.record.action === 'like') {
                console.log('new like received, subscribeToLikesCount', e.record);
                
                await get().fetchIncomingLikesProfiles();
              }

            });

            set({ unsubscribeLikes: unsub });
            return unsub;
        },

        reset: async () => {
            if (get().unsubscribeLikes) {
                await get().unsubscribeLikes?.();
            }
            
            set({
                incomingLikes: [],
                unreadCount: 0,
                isLoading: false,
                unsubscribeLikes: undefined
            });
        }

    })
);