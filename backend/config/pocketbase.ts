import EventSource from "react-native-sse";
// @ts-ignore
global.EventSource = EventSource;

import { SignInFormData, SignUpFormData } from '@/types/auth';
import { PBMatch, PBMessage, PBPet, PBUser } from '@/types/pbTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase, { AsyncAuthStore } from 'pocketbase';
import { IMessage } from 'react-native-gifted-chat';

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

const getFileName = (uri: string) => uri.split('/').pop() || 'photo.jpg';

// allow all requests - test it later
// pb.autoCancellation(false);

// logger
if (__DEV__) {
  pb.beforeSend = function (url, options) {
    console.log('------------------------------------------');
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
  signUp: async ({ email, password, passwordConfirm }: SignUpFormData): Promise<PBUser> => {
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm,
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
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key !== 'images' && data[key] !== undefined) {
        const value = data[key];
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else formData.append(key, data[key].toString());
      }
    });

    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        if (image.includes('file://')) {
          formData.append('images', {
            uri: image,
            name: getFileName(image),
            type: 'image/jpeg'
          })
        } else {
          const fileName = image.split('/').pop()?.split('?')[0];
          if (fileName) formData.append('images', fileName);
        }
      });
    }
    
    const updated = await pb.collection('users').update(userId, formData);

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
      })
    ));

    const pet = await pb.collection('pets').create(formData);
    return pet as PBPet;
  },

  updatePet: async (petId: string, data: Partial<PBPet>): Promise<PBPet> => {
    const formData = new FormData();

    // handle text fields
    Object.keys(data).forEach(key => {
      if (key !== 'images' && data[key] !== undefined) {
        formData.append(key, data[key].toString());
      }
    });

    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        if (image.includes('file://')) {
          formData.append('images', {
            uri: image,
            name: getFileName(image),
            type: 'image/jpeg'
          })
        } else {
          const fileName = image.split('/').pop()?.split('?')[0];
          if (fileName) formData.append('images', fileName);
        }
      });
    }
    
    const updated = await pb.collection('pets').update(petId, formData);

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

interface matchesWithMessages extends PBMatch {
  lastMessage: string;
  lastMessageTime: string;
}

/**
 * swipes + matches API
 */
export const swipesAPI = {

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

  getUserMatches: async (userId: string): Promise<matchesWithMessages[]> => {
    const matches: PBMatch[] = await pb.collection('matches').getFullList({
      filter: `(user1 = "${userId}" || user2 = "${userId}") && status = "active"`,
      expand: 'user1,user2,pet1,pet2',
      sort: '-created'
    });

    const matchesWithMessages = await Promise.all(matches.map(async (match) => {
      try {
        const lastMsgList = await pb.collection('messages').getList(1, 1, {
          filter: `match = "${match.id}"`,
          sort: '-created',
          requestKey: null
        });

        const lastMsg = lastMsgList.items[0];

        return {
          ...match,
          lastMessage: lastMsg ? lastMsg.content : '',
          lastMessageTime: lastMsg ? lastMsg.created : match.created
        };
      } catch (error) {
        console.log('matchesWithMessages, pocketbase.ts error: ', error);

        return {
          ...match,
          lastMessage: 'error retrieving a message',
          lastMessageTime: match.created
        };
      }
    }));

    matchesWithMessages.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return matchesWithMessages as matchesWithMessages[];
  }
};

export const messagesAPI = {
  getUser: async (userId: string): Promise<PBUser> => {
    const result: PBUser = await pb.collection('users').getOne(userId);
    return result;
  },

  sendMessage: async (matchId: string, senderId: string, content: string) => {
    return await pb.collection('messages').create({
      match: matchId,
      sender: senderId,
      content
    });
  },

  getMessages: async (matchId: string): Promise<PBMessage[]> => {
    return await pb.collection('messages').getFullList({
      filter: `match = "${matchId}"`,
      expand: 'sender',
      sort: '-created',
      requestKey: null
    });
  },

  unmatchProfile: async (matchId: string): Promise<void> => {
    await pb.send("/api/unmatch", {
      method: "POST",
      body: {
          matchId
      }
    });
  },

  markMessagesAsRead: async (matchId: string, userId: string) => {
    const unreadMsgs = await pb.collection('messages').getList(1, 50, {
      filter: `match = "${matchId}" && sender != "${userId}" && readAt = ""`,
      requestKey: null
    });

    await Promise.all(unreadMsgs.items.map(msg => pb.collection('messages').update(msg.id, { readAt: new Date().toISOString() })));
  },

  subscribe: async (matchId: string, userId: string, onNewMessage: (msg: IMessage) => void) => {
    return await pb.collection('messages').subscribe('*', e => {
      if (e.record.match !== matchId) return;

      // if (e.record.sender === userId) return;

      const newMsg: IMessage = {
        _id: e.record.id,
        text: e.record.content,
        createdAt: new Date(e.record.created),
        user: {
          _id: e.record.sender,
          name: 'match'
        }
      };

      onNewMessage(newMsg);
    });
  }
};

export const reportsAPI = {
  createReport: async (userId: string, reportedProfile: string, reason: string, reportDescription: string) => {
    await pb.collection('reports').create({
      reporter: userId,
      reportedUser: reportedProfile,
      reason,
      description: reportDescription
    });
  }
};