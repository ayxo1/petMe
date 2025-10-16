export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rodent' | 'other';

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  age: number;
  bio: string;
  images?: string[];
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
  images?: string[];
  isAvailableForAdoption: boolean;
  adoptionStatus?: 'available' | 'pending' | 'adopted' | undefined;
  adoptionRequirements?: string;
  adoptionReason?: string;
}