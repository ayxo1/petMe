import { ImageSourcePropType } from "react-native";

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rodent' | 'other';

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  age: number;
  bio: string;
  // images?: string[];
  images?: ImageSourcePropType[];
  createdAt: string;
  updatedAt?: string;
  isAvailableForAdoption: boolean;
  adoptionStatus?: 'available' | 'pending' | 'adopted';
  adoptionDetails?: {
    requirements?: string;
    reason?: string;
  };
}

export interface PetFormData {
  name: string;
  species: PetSpecies;
  breed?: string;
  age: number;
  bio: string;
  images?: ImageSourcePropType[];
  isAvailableForAdoption: boolean;
  adoptionStatus?: 'available' | 'pending' | 'adopted' | undefined;
  adoptionRequirements?: string;
  adoptionReason?: string;
}