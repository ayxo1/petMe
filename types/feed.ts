export interface FeedProfile {
    id: string;
    name: string;
    type: 'pet' | 'seeker' | 'owner' | 'shelter';
    ownerId: string;
    images: string[];
    bio: string;
    createdAt: string;
    updatedAt: string;

    age?: number;
    species?: string;
    breed?: string;
    isAvailableForAdoption?: boolean;
    adoptionStatus?: 'available' | 'pending' | 'adopted';
    adoptionDetails?: {
    requirements?: string;
    reason?: string;
    };

    location?: string;
}