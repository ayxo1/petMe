import { SignInFormData, SignUpFormData } from '@/types/auth';
import { PBPet, PBUser } from '@/types/pbTypes';
import 'dotenv/config';
import PocketBase, { type RecordModel } from 'pocketbase';

const PB_URL = __DEV__ 
    ? process.env.POCKETBASE_HOST
    : ''

export const pb = new PocketBase(PB_URL);

// allow all requests - test it later
// pb.autoCancellation(false);

// logger
if (__DEV__) {
  pb.beforeSend = function (url, options) {
    console.log('pb request:', url);
    return { url, options };
  };
  
  pb.afterSend = function (response, data) {
    console.log('pb response:', data, response);
    return data;
  };
};
//

/**
 * helpers
 */
export const getPBFileURL = (
  collectionName: string,
  recordId: string,
  filename: string,
  thumb?: string
): string => {
  if (!filename) return '';
  
  const baseUrl = `${PB_URL}/api/files/${collectionName}/${recordId}/${filename}`;
  return thumb ? `${baseUrl}?thumb=${thumb}` : baseUrl;
};

// check auth
export const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

// get current user
export const getCurrentUser = (): PBUser | null => {
  if (!isAuthenticated()) return null;
  return pb.authStore.record as PBUser;
};

// logout
export const signOut = (): void => {
  pb.authStore.clear();
};

/**
 * authAPI
 */
export const authAPI = {
  signUp: async ({ email, password, username }: SignUpFormData): Promise<PBUser> => {
    const user = await pb.collection('users').create({
      email,
      password,
      username
    });

    // auto login after signup
    await pb.collection('users').authWithPassword(email, password);

    return user as PBUser;
  },

  signIn: async ({ email, password }: SignInFormData): Promise<PBUser> => {
    const authData = await pb.collection('users').authWithPassword(email, password);

    return authData.record as PBUser;
  },

  updateProfile: async (userId: string, data: Partial<PBUser>): Promise<PBUser> => {
    const updated = await pb.collection('users').update(userId, data);

    return updated as PBUser;
  },
};

/**
 * petsAPI
 */
const petsAPI = {
  getUserPets: async (userId: string): Promise<PBPet[]> => {
    const records = await pb.collection('pets').getFullList({
      filter: `owner = "${userId}"`,
      sort: '-created'
    });

    return records as PBPet[];
  },

  createPet: async (data: Partial<PBPet>): Promise<PBPet> => {
    const formData = new FormData();

    // handle text fields
    Object.keys(data).forEach(key => {
      if (key !== 'images' && data[key] !== undefined) {
        formData.append(key, data[key].toString());
      }
    });

    data.images?.forEach(image => (
      formData.append('images', image)
    ));

    const pet = await pb.collection('pets').create(formData);
    return pet as PBPet;
  },

  updatePet: async (petId: string, data: Partial<PBPet>): Promise<PBPet> => {
    const updated = await pb.collection('pets').update(petId, data);

    return updated as PBPet;
  },

  deletePet: async (petId: string): Promise<void> => {
    await pb.collection('pets').delete(petId);
  },

  getPetFeed: async (
    currentUserId: string,
    excludeIds: string[],
    page: number = 1,
    perPage: number = 20,
    isAvailableForAdoption: boolean = false
  ): Promise<{ items: PBPet[], totalItems: number }> => {

    const excludeFilter = excludeIds.length > 0
      ? ` && ${excludeIds.map(id => ` id != "${id}"`).join(" && ")}`
      : '';

    const notOwnPets = ` && owner != "${currentUserId}"`;

    const result = await pb.collection('pets').getList(page, perPage, {
      filter: `isAvailableForAdoption = ${isAvailableForAdoption}${excludeFilter}${notOwnPets}`,
      expand: 'owner',
      sort: '-created'
    });

    return {
      items: result.items as PBPet[],
      totalItems: result.totalItems
    }
  },

  getSeekerFeed: async (
    currentUserId: string,
    excludeIds: string[],
    page: number = 1,
    perPage: number = 20,
  ): Promise<{ items: PBUser[], totalItems: number }> => {
    
    const excludeFilter = excludeIds.length > 0
      ? ` && ${excludeIds.map(id => `id != "${id}"`).join(' && ')}`
      : '';
    
    const result = await pb.collection('users').getList(page, perPage, {
      filter: `accountType = "seeker" && id != "${currentUserId}"${excludeFilter}`,
      sort: '-created'
    });

    return {
      items: result.items as PBUser[],
      totalItems: result.totalItems
    };
  }
  
};

/**
 * swipes + matches API
 */
export const swipesAPI = {
  recordPetSwipe: async (
    userId: string, 
    petId: string, 
    action: 'like' | 'pass'): Promise<void> => {
    await pb.collection('swipes').create({
      user: userId,
      targetPet: petId,
      targetUser: null,
      action,
      swipeType: 'pet'
    });

  },

  recordProfileSwipe: async (
    ownerId: string,
    seekerId: string,
    action: 'like' | 'pass'
  ): Promise<void> => {
    await pb.collection('swipes').create({
      user: ownerId,
      targetUser: seekerId,
      targetPet: null,
      action,
      swipeType: 'profile'
    });
  },
  // user's list of pets they swiped on
  getSwipedPetIds: async (userId: string): Promise<string[]> => {
    const swipes = await pb.collection('swipes').getFullList({
      filter: `user = "${userId}"`,
      fields: 'pet'
    });

    return swipes.map(swipe => swipe.pet);
  },
  // check if swipe => match
  // checkForMatch: async (userId: string, petId: string): Promise<boolean> => {
    
  // }
}