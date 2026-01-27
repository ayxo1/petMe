import { RecordModel } from "pocketbase";

export interface PBUser extends RecordModel {
  email: string;
  username: string;
  accountType: 'owner' | 'seeker' | 'shelter';
  bio: string;
  images: string[];
  city: string;
  coordinates: { lat: number; lng: number };
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
  targetId: string; // Pet ID
  swipeType: 'pet' | 'profile';
  created: string;
  updated: string;
}

export interface PBMatch extends RecordModel {
  user1: string;
  user2: string;
  pet1: string;
  pet2?: string;
  status: 'pending' | 'active' | 'declined' | 'unmatched' | 'blocked';
  created: string;
  updated: string;
}

export interface PBFeedRecord {
  id: string;
  name: string;
  type: 'pet' | 'seeker' | 'owner' | 'shelter';
  ownerId: string;
  images: string[];
  bio: string;
  age: number;
  ownerName?: string;
  ownerImage?: string;
  created: string;
  updated: string;

  species?: string;
  breed?: string;
  isAvailableForAdoption: boolean;
  adoptionStatus?: 'available' | 'pending' | 'adopted';
  adoptionRequirements?: string;
  adoptionReason?: string;

  location?: string;
}

export interface PBIncomingLikeProfile extends PBFeedRecord {
  likedTarget: string;
  likedTargetType: string;
  likedTargetName: string;
}

export interface PBMessage extends RecordModel {
  id: string;
  match: string;
  sender: string;
  content: string;
  readAt: string;
  created: string;
  updated: string;
}