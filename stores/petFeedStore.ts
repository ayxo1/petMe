import { PetProfile } from "@/types/pets";
import { create } from "zustand";

interface FeedState {
    petFeed: PetProfile[];
    currentIndex: number;
    isLoading: boolean;
    likedPets: string[],
    dislikedPets: string[],

    fetchProfileBatch: () => Promise<void>;
    swipeLike: (petId: string) => void;
    swipeDislike: (petId: string) => void;
    reset: () => void;
}

const petProfileFeedAPI = {
    fetchPets: async (limit: number, offset: number): Promise<PetProfile[]> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        return Array.from({ length: limit }, (PetProfile, index) => ({
            id: `petFeed-${offset + index}`,
            ownerId: `user-${Math.random()}`,
            name: `Pet ${offset + index}`,
            species: 'cat' as const,
            age: Math.floor(Math.random() * 10),
            bio: 'biooooo',
            images: [],
            isAvailableForAdoption: false,
            createdAt: new Date().toISOString()
        }));
    },
};

export const usePetFeedStore = create<FeedState>()((set, get) => ({
    petFeed: [],
    currentIndex: 0,
    isLoading: false,
    likedPets: [],
    dislikedPets: [],

    fetchProfileBatch: async () => {
        try {
            set({ isLoading: true });
            const offset = get().petFeed.length;
            const newPets = await petProfileFeedAPI.fetchPets(20, offset);

            set(state => ({
                petFeed: [...state.petFeed, ...newPets],
                isLoading: false,
                profilesLeft: true
            }));
        } catch (error) {
            console.log(error, 'pet profile fetch error');
            set({ isLoading: false });
            throw error;
        }
    },

    swipeLike: (petId: string) => {
        if(get().petFeed.length < 2) get().fetchProfileBatch();
        set(state => ({ 
            currentIndex: ++state.currentIndex,
            likedPets: [...state.likedPets, petId]
        }));
    },

    swipeDislike: (petId: string) => {
        if(get().petFeed.length < 2) get().fetchProfileBatch();
        set(state => ({ 
            currentIndex: ++state.currentIndex,
            dislikedPets: [...state.likedPets, petId]
        }));
    },

    reset: () => {
        set({
            petFeed: [],
            currentIndex: 0,
        })
    }
}));