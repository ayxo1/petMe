import { PetFormData, PetProfile } from '@/types/pets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

interface PetStoreState {
    pets: PetProfile[];
    isLoading: boolean;
    isHydrated: boolean;

    hydratePets: (userId: string) => Promise<void>;
    addPet: (petData: PetFormData) => Promise<void>;
    updatePet: (petId: string, petData: Partial<PetFormData>) => Promise<void>;
    deletePet: (petId: string) => Promise<void>;
    getPetById: (petId: string) => PetProfile | undefined;
    setLoading: (loading: boolean) => void;
}

const petAPI = {

    fetchUserPets: async (userId: string): Promise<PetProfile[]> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const stored = await AsyncStorage.getItem('pet-storage');
        if(stored) {
            const data = JSON.parse(stored);
            return data.state.pets || [];
        }
        return [];
    },
    
    addPet: async (ownerId: string, petData: PetFormData): Promise<PetProfile> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            id: Math.random().toString(),
            ownerId,
            ...petData,
            adoptionDetails: petData.isAvailableForAdoption ? {
                requirements: petData.adoptionRequirements,
                reason: petData.adoptionReason
            } : undefined,
            createdAt: new Date().toISOString()
        };
    },

    updatePet: async (petId: string, petData: Partial<PetProfile>): Promise<PetProfile> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const currentPet = usePetStore.getState().pets.find(pet => petId === pet.id);
        if(!currentPet) throw new Error('no pet found');

        return {
            ...currentPet,
            ...petData,
            updatedAt: new Date().toISOString()
        };
    },

    deletePet: async (petId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // backend soon™ to make it actually functional lul
    }
}

export const usePetStore = create<PetStoreState>()(
    persist(
        (set, get) => ({
            pets: [],
            isLoading: false,
            isHydrated: false,

            hydratePets: async (userId: string) => {
                try {
                    set({ isLoading: true });
                    const pets = await petAPI.fetchUserPets(userId);
                    set({
                        pets,
                        isLoading: false,
                        isHydrated: true
                    })
                } catch (error) {
                    console.log(error, 'pet hydration error');
                    throw error;
                }
            },

            addPet: async (petData: PetFormData) => {
                try {
                    set({ isLoading: true });

                    const currentUser = useAuthStore.getState().user;
                    if(!currentUser) throw new Error('no user logged in');

                    const newPet = await petAPI.addPet(currentUser.id, petData);
                    
                    set(state => ({
                        pets: [...state.pets, newPet],
                        isLoading: false
                    }));                    
                } catch (error) {
                    console.log(error, 'error adding a pet');
                    set({ isLoading: false });
                    throw error;
                }
            },

            updatePet: async (petId: string, petData: Partial<PetFormData>) => {
                try {
                    set({ isLoading: true});

                    const updatedPet = await petAPI.updatePet(petId, petData);

                    set(state => ({
                        pets: state.pets.map(pet => pet.id === petId ? updatedPet : pet),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ isLoading: false});
                    console.log(error, 'error updating a pet');
                    throw error;
                }
            },
            
            deletePet: async (petId: string) => {
                try {
                    set({ isLoading: true });
                    await petAPI.deletePet(petId);

                    set(state => ({
                        pets: state.pets.filter(pet => pet.id !== petId),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ isLoading: false });
                    console.log(error, 'error deleting a pet');
                    throw error;                    
                }
            },
            
            getPetById: (petId: string) => {
                return get().pets.find(pet => pet.id === petId);
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            }
        }),
        {
        name: 'pet-storage',
        storage: createJSONStorage(() => AsyncStorage),
        }
    )
)