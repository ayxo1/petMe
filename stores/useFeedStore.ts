import { getCurrentUser, pb } from "@/backend/config/pocketbase";
import { FeedProfile } from "@/types/feed";
import { PBFeedRecord, PBPet, PBUser } from "@/types/pbTypes";
import { create } from "zustand";

interface FeedState {
    feed: FeedProfile[];
    currentIndex: number;
    isLoading: boolean;
    feedType: string;

    fetchProfileBatch: (type?: string) => Promise<void>;
    swipeLike: (id: string) => Promise<{ isMatch: boolean; matchId?: string, isExisting?: boolean }>;
    swipePass: (id: string) => void;
    getCurrentProfile: () => FeedProfile | null;
    getRemaningProfiles: () => number;
    reset: () => void;
};

const convertPBFeedRecordToFeedProfile = (record: PBFeedRecord): FeedProfile => {    
    const collectionName = record.type === 'pet' ? 'pets' : 'users';
    let imageUrls: string[] = [];
    imageUrls = record.images.map(filename => `${pb.baseURL}/api/files/${collectionName}/${record.id}/${filename}`);
console.log('isAvailableForAdoption log:', record.isAvailableForAdoption);
    return {
        id: record.id,
        name: record.name,
        type: record.type,
        ownerId: record.ownerId,
        species: record.species,
        breed: record.breed,
        age: record.age,
        bio: record.bio,
        distance: record.distance,
        images: imageUrls,
        ownerName: record.ownerName,
        ownerImage: record.ownerImage,
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

const PREFETCH_THRESHOLD = 3;
const BATCH_SIZE = 20;

export const useFeedStore = create<FeedState>(
    (set, get) => ({
        feed: [],
        currentIndex: 0,
        isLoading: false,
        feedType: 'pets,seekers,shelters,rescue',
    
        fetchProfileBatch: async (type) => {
            const state = get();
            if(state.isLoading) {
                console.log('a batch is already loading');
                return;
            };

            const currentUser = getCurrentUser();
            if(!currentUser) {
                console.error('no user is logged in');
                set({ isLoading: false });
                return;
            };

            try {
                set({ isLoading: true });
                
                const page = 1 // offset for profile pagination

                const result = await pb.send<{ items: PBFeedRecord[] }>("/api/feed", {
                    params: {
                        type: type ? type : state.feedType,
                        page: page.toString(),
                        perPage: BATCH_SIZE.toString()
                    }
                });
                
                const newPets = result.items.map(convertPBFeedRecordToFeedProfile);

                set(state => {
                    // idempotency life
                    const uniqueNewPets = newPets.filter(newPet => !state.feed.some(existing => existing.id === newPet.id));

                    return {
                        feed: [...state.feed, ...uniqueNewPets],
                        isLoading: false
                    };
                });
                
            } catch (error) {
                console.log('profile fetch error:', error);
                set({ isLoading: false });
                throw error;
            }
        },
    
        swipeLike: async (id: string) => {
            const currentUser = getCurrentUser();
            if(!currentUser) {
                console.error('no user is logged in (swipeLike)');
                return {isMatch: false};
            };
            
            // advance feed
            set(state => ({ currentIndex: state.currentIndex + 1}));

            try {
                // Call the server-side endpoint
                const response = await pb.send<{ isMatch: boolean; matchId?: string, isExisting?: boolean }>("/api/swipe", {
                    method: "POST",
                    body: {
                        targetId: id,
                        action: "like"
                    }
                });

                // prefetch check
                const remaining = get().feed.length - get().currentIndex;
                
                if (remaining < PREFETCH_THRESHOLD) {
                    get().fetchProfileBatch();
                }
                
                console.log('match result issss ', response.isMatch);
                
                return {
                    isMatch: response.isMatch,
                    matchId: response.matchId,
                    isExisting: response.isExisting
                };

            } catch (error) {
                console.error('swipeLike error:', error);
                return {isMatch: false};
            }
        },
    
        swipePass: async (id: string) => {
            const currentUser = getCurrentUser();
            if(!currentUser) {
                console.error('no user is logged in');
                return;
            };
            
            try {
                await pb.send("/api/swipe", {
                    method: "POST",
                    body: {
                        targetId: id,
                        action: "pass"
                    }
                });

                set(state => ({ currentIndex: state.currentIndex + 1 }));

                const remainingPets = get().feed.length - get().currentIndex;
                if(remainingPets < PREFETCH_THRESHOLD) get().fetchProfileBatch();
            } catch (error) {
                console.error('swipePass error:', error);
            }
        },
    
        getCurrentProfile: () => {
            const { feed, currentIndex } = get();
            return feed[currentIndex] || null;
        },
    
        getRemaningProfiles: () => {
            const { feed, currentIndex } = get();
            return Math.max(0, feed.length - currentIndex);
        },
    
        reset: () => {
            set({
                feed: [],
                currentIndex: 0,
                isLoading: false
            })
        }
    })
);