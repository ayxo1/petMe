import { RecordModel } from "pocketbase";

export interface PBUser extends RecordModel {
  email: string;
  username: string;
  accountType: 'owner' | 'seeker' | 'shelter';
  bio?: string;
  profileImage?: string;
  coordinates?: { lat: number; lng: number };
  created: string;
  updated: string;
}

export interface PBPet extends RecordModel {
  owner: string; // User ID
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rodent' | 'other';
  breed?: string;
  age: number;
  bio: string;
  images: string[]; // Filenames, need to construct full URLs
  isAvailableForAdoption: boolean;
  adoptionStatus?: 'available' | 'pending' | 'adopted';
  adoptionRequirements?: string;
  adoptionReason?: string;
  // on xpanded:
  expand?: {
    owner: PBUser;
  };
  created: string;
  updated: string;
}

export interface PBSwipe {
  id: string;
  action: 'like' | 'pass';
  targetUser: string; // User ID
  targetPet: string; // Pet ID
  swipeType: 'pet' | 'profile';
  created: string;
  updated: string;
}

export interface PBMatch extends RecordModel {
  user1: string;
  user2: string;
  pet1: string;
  pet2?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created: string;
  updated: string;
}