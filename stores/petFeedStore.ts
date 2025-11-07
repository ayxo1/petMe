import { PetProfile } from "@/types/pets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { usePetStore } from "./petStore";

interface FeedState {
    petFeed: PetProfile[];
    currentIndex: number;
    isLoading: boolean;
    likedPets: string[],
    passedPets: string[]
    matches: string[]
    PREFETCH_THRESHOLD: number,

    fetchProfileBatch: () => Promise<void>;
    swipeLike: (petId: string) => void;
    swipePass: (petId: string) => void;
    getCurrentPet: () => PetProfile | null;
    getRemaningPets: () => number;
    checkForMatch: (petId: string) => Promise<boolean>;
    reset: () => void;
};

const PREFETCH_THRESHOLD = 3;
const BATCH_SIZE = 20;

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

    checkForMatch: async (petId: string, yourPetIds: string[]): Promise<boolean> => {
        // backend inc, promise
        return Math.random() > 0.9;
    }
};

export const usePetFeedStore = create<FeedState>()(
    
    persist(
        (set, get) => ({
            petFeed: [],
            currentIndex: 0,
            isLoading: false,
            likedPets: [],
            passedPets: [],
            matches: [],
            PREFETCH_THRESHOLD,
        
            fetchProfileBatch: async () => {
                try {
                    set({ isLoading: true });
                    const offset = get().petFeed.length;
                    const newPets = await petProfileFeedAPI.fetchPets(BATCH_SIZE, offset);
        
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
                const remainingPets = get().petFeed.length - get().currentIndex;
                if(remainingPets < PREFETCH_THRESHOLD) get().fetchProfileBatch();
        
                set(state => ({ 
                    currentIndex: ++state.currentIndex,
                    likedPets: [...state.likedPets, petId]
                }));
            },
        
            swipePass: (petId: string) => {
                const remainingPets = get().petFeed.length - get().currentIndex;
                if(remainingPets < PREFETCH_THRESHOLD) get().fetchProfileBatch();
        
                set(state => ({ 
                    currentIndex: ++state.currentIndex,
                    passedPets: [...state.passedPets, petId]
                }));
            },
        
            getCurrentPet: () => {
                const { petFeed, currentIndex } = get();
                return petFeed[currentIndex];
            },
        
            getRemaningPets: () => {
                const { petFeed, currentIndex } = get();
                return petFeed.length - currentIndex;
            },
        
            checkForMatch: async (petId: string) => {
                const yourPetIds = usePetStore.getState().pets.map(pet => pet.id);
                
                try {
                    const isMatch = await petProfileFeedAPI.checkForMatch(petId, yourPetIds);
                    if(isMatch) {
                        set(state => ({
                            matches: [...state.matches, petId]
                        }));
                        return isMatch;
                    };
                    return false;
                } catch (error) {
                    console.log(error, 'checkForMatch error');
                    throw error;
                };
            },
        
            reset: () => {
                set({
                    petFeed: [],
                    likedPets: [],
                    passedPets: [],
                    currentIndex: 0,
                    matches: []
                })
            }
        
        }),
        {
            name: 'petfeed-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: ({ likedPets, passedPets, matches }) => ({
                likedPets,
                passedPets,
                matches
            })
        }
    )
);