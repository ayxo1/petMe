import { getCurrentUser, pb, petsAPI, swipesAPI } from "@/backend/config/pocketbase";
import { PBPet } from "@/types/pbTypes";
import { PetProfile } from "@/types/pets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { usePetStore } from "./petStore";

interface FeedState {
    petFeed: PetProfile[];
    currentIndex: number;
    isLoading: boolean;

    fetchProfileBatch: () => Promise<void>;
    swipeLike: (petId: string) => Promise<boolean>;
    swipePass: (petId: string) => void;
    getCurrentPet: () => PetProfile | null;
    getRemaningPets: () => number;
    reset: () => void;
};

const convertPBPetToPetProfile = (pbPet: PBPet): PetProfile => {
    const imageUrls = pbPet.images.map(filename => 
        `${pb.baseURL}/api/files/pets/${pbPet.id}/${filename}`
    );

    return {
        id: pbPet.id,
        ownerId: pbPet.owner,
        name: pbPet.name,
        species: pbPet.species,
        breed: pbPet.breed,
        age: pbPet.age,
        bio: pbPet.bio,
        images: imageUrls,
        isAvailableForAdoption: pbPet.isAvailableForAdoption,
        adoptionStatus: pbPet.adoptionStatus,
        adoptionDetails: pbPet.isAvailableForAdoption ? {
            requirements: pbPet.adoptionRequirements,
            reason: pbPet.adoptionReason
        } : undefined,
        createdAt: pbPet.created,
        updatedAt: pbPet.updated
    };
};

const PREFETCH_THRESHOLD = 3;
const BATCH_SIZE = 20;

export const usePetFeedStore = create<FeedState>(
    (set, get) => ({
        petFeed: [],
        currentIndex: 0,
        isLoading: false,
    
        fetchProfileBatch: async () => {
            const state = get();
            if(state.isLoading) {
                console.log('a batch is already loading');
                return;
            };

            const currentUser = getCurrentUser();
            console.log('Sending request with token:', pb.authStore.token);
            console.log('Is valid?', pb.authStore.isValid);
            console.log('User ID:', currentUser?.id);
            if(!currentUser) {
                console.error('no user is logged in');
                set({ isLoading: false });
                return;
            };

            try {
                set({ isLoading: true });
                
                const page = 1 // offset for profile pagination

                const result = await pb.send<{ items: PBPet[]}>("/api/pet-feed", {
                    params: {
                        page: page.toString(),
                        perPage: BATCH_SIZE.toString()
                    },
                    headers: {
                        "Authorization": "Bearer " + pb.authStore.token
                    }
                });

                const newPets = result.items.map(convertPBPetToPetProfile);

                set(state => ({
                    petFeed: [...state.petFeed, ...newPets],
                    isLoading: false
                }));
                
            } catch (error) {
                console.log('pet profile fetch error:', error);
                set({ isLoading: false });
                throw error;
            }
        },
    
        swipeLike: async (petId: string) => {
            const state = get();
            const currentUser = getCurrentUser();
            if(!currentUser) {
                console.error('no user is logged in (swipeLike)');
                return false;
            };
            
            try {
                // add a record to the pb db (swipes collection) - optimistic ui.. almost
                await swipesAPI.recordPetSwipe(currentUser.id, petId, 'like');

                // check if it's a matchhh
                const matchResult = await swipesAPI.checkForMatch(currentUser.id, petId);

                // advance feed
                set(state => ({ currentIndex: state.currentIndex + 1}));

                // prefetch check
                const remaining = get().petFeed.length - get().currentIndex;
                if (remaining < PREFETCH_THRESHOLD) {
                    get().fetchProfileBatch();
                }
                
                return matchResult.isMatch;

            } catch (error) {
                console.error('swipeLike error:', error);
                return false;
            }
        },
    
        swipePass: async (petId: string) => {
            const currentUser = getCurrentUser();
            if(!currentUser) {
                console.error('no user is logged in');
                return;
            };
            
            try {
                await swipesAPI.recordPetSwipe(currentUser.id, petId, 'pass');

                set(state => ({ currentIndex: state.currentIndex + 1 }));

                const remainingPets = get().petFeed.length - get().currentIndex;
                if(remainingPets < PREFETCH_THRESHOLD) get().fetchProfileBatch();
            } catch (error) {
                console.error('swipePass error:', error);
            }
        },
    
        getCurrentPet: () => {
            const { petFeed, currentIndex } = get();
            return petFeed[currentIndex] || null;
        },
    
        getRemaningPets: () => {
            const { petFeed, currentIndex } = get();
            return Math.max(0, petFeed.length - currentIndex);
        },
    
        reset: () => {
            set({
                petFeed: [],
                currentIndex: 0,
                isLoading: false
            })
        }
    })
);