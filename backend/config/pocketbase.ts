import { SignInFormData, SignUpFormData } from '@/types/auth';
import { PBMatch, PBPet, PBUser } from '@/types/pbTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase, { AsyncAuthStore, type RecordModel } from 'pocketbase';

const PB_URL = __DEV__ 
    ? (process.env.EXPO_PUBLIC_POCKETBASE_HOST?.startsWith('http')
        ? process.env.EXPO_PUBLIC_POCKETBASE_HOST 
        : `http://${process.env.EXPO_PUBLIC_POCKETBASE_HOST}:8090`)
    : ''

const store = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
  initial: AsyncStorage.getItem('pb_auth'),
  clear: async () => AsyncStorage.removeItem('pb_auth'),
});

export const pb = new PocketBase(PB_URL, store);

// allow all requests - test it later
// pb.autoCancellation(false);

// logger
if (__DEV__) {
  pb.beforeSend = function (url, options) {
    console.log('pb request:', JSON.stringify(url, null, 2));
    return { url, options };
  };
  
  pb.afterSend = function (response, data) {
    console.log('pb response:', JSON.stringify(data, null, 2), JSON.stringify(response, null, 2));
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
  
  const baseUrl = `${PB_URL}:8090/api/files/${collectionName}/${recordId}/${filename}`;
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
  signUp: async ({ email, password, username, passwordConfirm }: SignUpFormData): Promise<PBUser> => {
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm,
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
export const petsAPI = {
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
      formData.append('images', {
        uri: image,
        name: image,
        type: 'image/jpeg'
      } as any)
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
      targetId: petId,
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
      targetId: null,
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

  getSwipedProfileIds: async (userId: string): Promise<string[]> => {
    const swipes = await pb.collection('swipes').getFullList({
      filter: `user = "${userId}" && swipeType = "profile"`,
      fields: 'targetUser'
    });

    return swipes.map(swipe => swipe.targetUser).filter(Boolean);
  },
  // check if swipe => match
  checkForMatch: async (userId: string, petId: string): Promise<{ isMatch: boolean; matchType?: 'instant' | 'mutual' }> => {
    // get the pet and the owner
    const pet = await pb.collection('pets').getOne(petId);
    const petOwnerId = pet.owner;

    // get current user's account type + pets
    const currentUser = await pb.collection('users').getOne(userId);
    const userPets = await petsAPI.getUserPets(userId);

    // scenario 1: seeker swipes on a pet
    // type check: handle both string 'seeker' and array ['seeker']
    const isSeeker = Array.isArray(currentUser.accountType) 
        ? currentUser.accountType.includes('seeker') 
        : currentUser.accountType === 'seeker';

    if (isSeeker || userPets.length === 0) {
      // check if the seeker was already liked by the onwer
      const onwerPreApproval = await pb.collection('swipes').getFullList({
        filter: `user = "${petOwnerId}" && targetUser = "${userId}" && action = "like" && swipeType = "profile"`
      });

      if (onwerPreApproval.length > 0) {
        return { isMatch: true, matchType: 'instant' };
      }

      return { isMatch: false };
    }

    // scenario 2: owner swiped on another owner's pet
    const isOwner = Array.isArray(currentUser.accountType) 
        ? currentUser.accountType.includes('owner') 
        : currentUser.accountType === 'owner';

    if (isOwner && userPets.length > 0) {
      const userPetIds = userPets.map(pet => pet.id);

      console.log('--- checking for match (owner scenario) ---');
      console.log('User ID:', userId);
      console.log('Swiped Pet Owner:', petOwnerId);
      console.log('My Pets:', userPetIds);
      
      // check if the owner liked any of our pets
      const filterQuery = `user = "${petOwnerId}" && action = "like" && swipeType = "pet" && (${userPetIds.map(id => `targetId = "${id}"`).join(' || ')})`;
      console.log('Filter Query:', filterQuery);

      // DEBUG: See what they actually liked
      const debugLikes = await pb.collection('swipes').getList(1, 50, {
          filter: `user = "${petOwnerId}" && action = "like" && swipeType = "pet"`
      });
      console.log("DEBUG: The other user has liked these pets:", debugLikes.items.map(i => i.targetId));
      console.log("DEBUG: Checking against my pets:", userPetIds);

      const mutualLike = await pb.collection('swipes').getFullList({
        filter: filterQuery
      });

      console.log('Mutual Likes Found:', mutualLike.length);

      if (mutualLike.length > 0) return { isMatch: true, matchType: 'mutual' };
    }

    return { isMatch: false };
  },

  getPendingRequests: async (ownerId: string): Promise<any[]> => {
    const ownerPets = await petsAPI.getUserPets(ownerId);
    const petIds = ownerPets.map(pet => pet.id);

    if (petIds.length === 0) return [];
    
    // find all likes on owner's pets by seekers
    const requests = await pb.collection('swipes').getFullList({
      filter: `action = "like" && swipeType = "pet" && (${petIds.map(id => `targetId = "${id}"`).join(" || ")})`,
      expand: 'user,targetId',
      sort: '-created'
    });

    // filter requests where owner already preapproved
    const preApprovedUsers = await pb.collection('swipes').getFullList({
      filter: `user = "${ownerId}" && action = "like" && swipeType = "profile"`,
      fields: 'targetUser'
    });

    return requests.filter(request => !preApprovedUsers.includes(request.user));
  },

  createMatch: async (
    user1Id: string,
    user2Id: string,
    pet1Id: string,
    pet2Id?: string
  ): Promise<PBMatch> => {
    const match = await pb.collection('matches').create({
      user1: user1Id,
      user2: user2Id,
      pet1: pet1Id,
      pet2: pet2Id || null,
      status: 'pending'
    });

    return match as PBMatch;
  },

  approveRequest: async (
    ownerId: string,
    seekerId: string,
    petId: string
  ): Promise<PBMatch> => {
    return await swipesAPI.createMatch(seekerId, ownerId, petId);
  },

  getUserMatches: async (userId: string): Promise<PBMatch[]> => {
    const matches = await pb.collection('matches').getFullList({
      filter: `(user = ${userId} || user2 = "${userId}") && status != "declined"`,
      expand: 'user1,user2,pet1,pet2',
      sort: '-created'
    });

    return matches as PBMatch[];
  }
};

export const messagesAPI = {
  sendMessage: async (matchId: string, senderId: string, content: string) => {
    return await pb.collection('messages').create({
      match: matchId,
      sender: senderId,
      content
    });
  },

  getMessages: async (matchId: string) => {
    return await pb.collection('messages').getFullList({
      filter: `match = "${matchId}"`,
      expand: 'sender',
      sort: '-created'
    });
  }
};