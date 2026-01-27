import { pb, petsAPI } from '@/backend/config/pocketbase';
import { PBPet } from '@/types/pbTypes';
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
    reset: () => void;
}

const convertPBPetToPetProfile = (pbPet: PBPet): PetProfile => {
    const imageUrls = pbPet.images.map(filename => `${pb.baseURL}/api/files/pets/${pbPet.id}/${filename}`);
    
    return {
        id: pbPet.id,
        ownerId: pbPet.owner,
        name: pbPet.name,
        species: pbPet.species,
        breed: pbPet.breed,
        age: +(pbPet.age),
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

export const usePetStore = create<PetStoreState>()(
    persist(
        (set, get) => ({
            pets: [],
            isLoading: false,
            isHydrated: false,

            hydratePets: async (userId: string) => {
                try {
                    set({ isLoading: true });

                    const pbPets = await petsAPI.getUserPets(userId);
                    const pets = pbPets.map(convertPBPetToPetProfile);

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

                    const pbPet = await petsAPI.createPet({
                        owner: currentUser.id,
                        name: petData.name,
                        species: petData.species,
                        breed: petData.breed,
                        age: petData.age,
                        bio: petData.bio,
                        images: petData.images,
                        isAvailableForAdoption: petData.isAvailableForAdoption,
                        adoptionStatus: petData.adoptionStatus || undefined,
                        adoptionRequirements: petData.adoptionRequirements,
                        adoptionReason: petData.adoptionReason
                    });

                    const newPet = convertPBPetToPetProfile(pbPet);
                    
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

                    const pbPet = await petsAPI.updatePet(petId, {
                        name: petData.name,
                        species: petData.species,
                        breed: petData.breed,
                        age: petData.age,
                        bio: petData.bio,
                        images: petData.images,
                        isAvailableForAdoption: petData.isAvailableForAdoption,
                        adoptionStatus: petData.adoptionStatus || undefined,
                        adoptionRequirements: petData.adoptionRequirements,
                        adoptionReason: petData.adoptionReason
                    });                    

                    const updatedPet = convertPBPetToPetProfile(pbPet);

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

                    await petsAPI.deletePet(petId);

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
            },

            reset: () => {
                set({
                    pets: [],
                    isLoading: false,
                    isHydrated: false,
                });
            }
        }),
        {
        name: 'pet-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: ({ pets }) => ({
            pets
        })
        }
    )
);