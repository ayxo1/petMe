import { pb, shelterAPI } from '@/backend/config/pocketbase';
import { ShelterProfile } from '@/types/auth';
import { PBShelterProfile } from '@/types/pbTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ShelterStoreState {
    shelterProfile: ShelterProfile | null;
    isLoading: boolean;
    isHydrated: boolean;

    hydrateShelter: (userId: string) => Promise<void>;
    addShelter: (shelterData: ShelterProfile) => Promise<void>;
    updateShelter: (shelterId: string, shelterData: Partial<ShelterProfile>) => Promise<void>;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

export const convertPBShelterToShelterProfile = (pbShelter: PBShelterProfile): ShelterProfile => {
    
    const imageUrl = `${pb.baseURL}/api/files/shelters/${pbShelter.id}/${pbShelter.image}`;

    return {
        id: pbShelter.id,
        name: pbShelter.name,
        owner: pbShelter.owner,
        image: imageUrl,
        description: pbShelter.description,
        address: pbShelter.address,
        createdAt: pbShelter.created,
        updatedAt: pbShelter.updated
    };
};

export const useShelterStore = create<ShelterStoreState>()(
    persist(
        (set, get) => ({
            shelterProfile: null,
            isLoading: false,
            isHydrated: false,

            hydrateShelter: async (userId: string) => {
                try {
                    set({ isLoading: true });

                    const pbShelter = await shelterAPI.getUserShelter(userId);
                    const shelterProfile = convertPBShelterToShelterProfile(pbShelter);

                    set({
                        shelterProfile,
                        isLoading: false,
                        isHydrated: true
                    });
                } catch (error) {
                    console.log(error, 'shelterProfile hydration error, shelterStore.tsx:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            addShelter: async (shelterData: ShelterProfile) => {
                try { 
                    set({ isLoading: true });
                    const pbShelter = await shelterAPI.createShelter(shelterData);
                    const shelterProfile = convertPBShelterToShelterProfile(pbShelter);
                    set({
                        shelterProfile,
                        isLoading: false
                    });
                } catch (error) {
                    console.log('shelterStore, addShelter error:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            updateShelter: async (shelterId: string, shelterData: Partial<ShelterProfile>) => {
                try {
                    set({ isLoading: true });
                    const pbShelter = await shelterAPI.updateShelterProfile(shelterId, shelterData);
                    const updatedShelter = convertPBShelterToShelterProfile(pbShelter);
                    set({ 
                        shelterProfile: updatedShelter, 
                        isLoading: false 
                    });
                } catch (error) {
                    console.log('updateShelter, shelterStore.tsx error: ', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            reset: () => {
                set({
                    shelterProfile: null,
                    isLoading: false,
                    isHydrated: false,
                });
            }
        }),
        {
        name: 'shelter-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: ({ shelterProfile }) => ({
            shelterProfile
        })
        }
    )
);