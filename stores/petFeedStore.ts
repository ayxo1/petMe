import { PetProfile } from "@/types/pets";
import { fetchPetsFromDB, getTotalPetCount } from "@/utils/mockPetDb";
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

    fetchProfileBatch: () => Promise<void>;
    swipeLike: (petId: string) => Promise<boolean>;
    swipePass: (petId: string) => void;
    getCurrentPet: () => PetProfile | null;
    getRemaningPets: () => number;
    checkForMatch: (petId: string) => Promise<boolean>;
    reset: () => void;
};

const PREFETCH_THRESHOLD = 2;
const BATCH_SIZE = 20;

const petProfileFeedAPI = {
    fetchPets: async (limit: number, offset: number, excludeIds: string[]): Promise<PetProfile[]> => {

        return await fetchPetsFromDB(limit, offset, excludeIds);

        // return Array.from({ length: limit }, (PetProfile, index) => ({
        //     id: `petFeed-${offset + index}`,
        //     ownerId: `user-${Math.random()}`,
        //     name: `Pet ${offset + index}`,
        //     species: 'cat' as const,
        //     age: Math.floor(Math.random() * 10),
        //     bio: 'biooooo',
        //     images: [],
        //     isAvailableForAdoption: false,
        //     createdAt: new Date().toISOString()
        // }));
    },

    getTotalCount: (excludeIds: string[]): number => {
        return getTotalPetCount(excludeIds);
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
        
            fetchProfileBatch: async () => {
                const state = get();
                if(state.isLoading) return;

                try {
                    set({ isLoading: true });
                    
                    const offset = state.petFeed.length;
                    const excludeIds = [
                        ...state.likedPets,
                        ...state.passedPets
                    ];
                    const newPets = await petProfileFeedAPI.fetchPets(BATCH_SIZE, offset, excludeIds);
        
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
        
            swipeLike: async (petId: string) => {
                const state = get();

                const isMatch = await state.checkForMatch(petId);

                set(state => ({ 
                    currentIndex: ++state.currentIndex,
                    likedPets: [...state.likedPets, petId],
                    matches: isMatch ? [...state.matches, petId] : state.matches
                }));

                const remainingPets = state.petFeed.length - state.currentIndex;
                if(remainingPets < PREFETCH_THRESHOLD) await state.fetchProfileBatch();

                return isMatch;
            },
        
            swipePass: async (petId: string) => {
                const state = get();
                
                set(state => ({ 
                    currentIndex: ++state.currentIndex,
                    passedPets: [...state.passedPets, petId]
                }));

                const remainingPets = state.petFeed.length - state.currentIndex;
                if(remainingPets < PREFETCH_THRESHOLD) await state.fetchProfileBatch();
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