import { images } from '@/constants';
import { PetProfile } from '@/types/pets';

export const MOCK_PET_DATABASE: PetProfile[] = [
  {
    id: 'pet-001',
    ownerId: 'user-123',
    name: 'mr. Eggplant',
    species: 'cat',
    breed: 'Eggplant Mix',
    age: 3,
    bio: 'just a friendly eggplant, definitely without any malicious thoughts. loves cuddles and sunny spots.',
    images: [images.mrEggPlant],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-002',
    ownerId: 'user-456',
    name: 'mr. ket',
    species: 'cat',
    breed: 'Balinese',
    age: 2,
    bio: 'cool ket from bali just living the life. very chill, loves beach vibes.',
    images: [images.ket],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-003',
    ownerId: 'user-789',
    name: 'mr. penthouse',
    species: 'cat',
    breed: 'Persian',
    age: 5,
    bio: 'living luxury life in penthouse, what do you got to offer. only the finest treats.',
    images: [images.penthouseKet],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-004',
    ownerId: 'user-321',
    name: 'fluffy mcflufferson',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 4,
    bio: 'loves fetch, belly rubs, and making new friends. certified good boy.',
    images: [images.mrEggPlant],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-005',
    ownerId: 'user-654',
    name: 'shadow',
    species: 'cat',
    breed: 'Black Cat',
    age: 1,
    bio: 'mysterious and playful. brings good luck (not bad!). loves hide and seek.',
    images: [images.ket],
    isAvailableForAdoption: true,
    adoptionStatus: 'available',
    adoptionDetails: {
      requirements: 'indoor home, patient owner',
      reason: 'owner moving abroad'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-006',
    ownerId: 'user-987',
    name: 'chirpy',
    species: 'bird',
    breed: 'Cockatiel',
    age: 2,
    bio: 'sings every morning! knows 5 whistled songs. loves millet.',
    images: [images.penthouseKet],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-007',
    ownerId: 'user-456',
    name: 'mr. ket',
    species: 'cat',
    breed: 'Balinese',
    age: 2,
    bio: 'cool ket from bali just living the life. very chill, loves beach vibes.',
    images: [images.ket],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-008',
    ownerId: 'user-789',
    name: 'mr. penthouse',
    species: 'cat',
    breed: 'Persian',
    age: 5,
    bio: 'living luxury life in penthouse, what do you got to offer. only the finest treats.',
    images: [images.penthouseKet],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-009',
    ownerId: 'user-321',
    name: 'fluffy mcflufferson',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 4,
    bio: 'loves fetch, belly rubs, and making new friends. certified good boy.',
    images: [images.mrEggPlant],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-010',
    ownerId: 'user-654',
    name: 'shadow',
    species: 'cat',
    breed: 'Black Cat',
    age: 1,
    bio: 'mysterious and playful. brings good luck (not bad!). loves hide and seek.',
    images: [images.ket],
    isAvailableForAdoption: true,
    adoptionStatus: 'available',
    adoptionDetails: {
      requirements: 'indoor home, patient owner',
      reason: 'owner moving abroad'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pet-011',
    ownerId: 'user-987',
    name: 'chirpy',
    species: 'bird',
    breed: 'Cockatiel',
    age: 2,
    bio: 'sings every morning! knows 5 whistled songs. loves millet.',
    images: [images.penthouseKet],
    isAvailableForAdoption: false,
    createdAt: new Date().toISOString(),
  },
];


export const fetchPetsFromDB = async (
  limit: number,
  offset: number,
  excludeIds: string[] = []
): Promise<PetProfile[]> => {

  await new Promise(resolve => setTimeout(resolve, 500));

  const availablePets = MOCK_PET_DATABASE.filter(
    pet => !excludeIds.includes(pet.id)
  );

  return availablePets.slice(offset, offset + limit);
};

// no more profiles check
export const getTotalPetCount = (excludeIds: string[] = []): number => {
  return MOCK_PET_DATABASE.filter(pet => !excludeIds.includes(pet.id)).length;
};