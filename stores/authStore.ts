import { authAPI, pb, signOut as pbSignOut } from '@/backend/config/pocketbase';
import { PBUser } from '@/types/pbTypes';
import { stringImageToPbUrl } from '@/utils/stringImageToPbUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthState, RegistrationState, SignInFormData, SignUpFormData, User } from '../types/auth';

const convertPBUserToUser = (pbUser: PBUser): User => {
  
  const imageUrls = pbUser.images.map(filename => stringImageToPbUrl(filename, 'users', pbUser.id));

  return {
    id: pbUser.id,
    email: pbUser.email,
    username: pbUser.username,
    images: imageUrls,
    bio: pbUser.bio,
    location: {
      city: pbUser.city,
      coordinates: pbUser.coordinates
    },
    accountType: pbUser.accountType,
    createdAt: pbUser.createdAt,
    updatedAt: pbUser.updatedAt
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Init state
      isAuthenticated: false,
      user: null,
      isLoading: false,
      isHydrated: false,
      registrationState: 'not_started',
      
      init: async () => {
        if (!pb.authStore.isValid && get().isAuthenticated) {
          get().signOut(); 
        };
      },

      hydrateUser: async () => {
        try {
            set({ isLoading: true });

            const currentId = pb.authStore.record?.id;
            if (!currentId) {
              return;
            }
            const freshUserData = await pb.collection('users').getOne(currentId);
            pb.authStore.save(pb.authStore.token, freshUserData);

            const convertedUser = convertPBUserToUser(freshUserData as PBUser);

            set({
                user: convertedUser,
                isLoading: false,
                isHydrated: true
            });
        } catch (error) {
            console.log(error, 'user hydration error');
            get().signOut();
            throw error;
        }
      },

      signIn: async (userData: SignInFormData) => {
        try {
          set({ isLoading: true });
          const pbUser = await authAPI.signIn({
            email: userData.email,
            password: userData.password
          });

          const user = convertPBUserToUser(pbUser);

          set({ 
            isAuthenticated: true, 
            user,
            isLoading: false,
          });

        } catch (error) {
          set({ isLoading: false });
          console.error('authStore sign in error ', error);
          throw error;
        }
      },

      signUp: async (userData: SignUpFormData) => {
        try {
          set({ isLoading: true })
          
          const pbUser = await authAPI.signUp({
            email: userData.email,
            password: userData.password,
            passwordConfirm: userData.passwordConfirm,
          });

          const newUser = convertPBUserToUser(pbUser);
          
          set({ 
            isAuthenticated: true, 
            user: newUser,
            isLoading: false,
          });
          
          // await usePetStore.setState({ pets: [], isHydrated: true });
        } catch (error) {
          set({ isLoading: false })
          console.log(JSON.stringify(error, null, 2), ' signup error AuthStore');
          throw error;
        }
      },

      signOut: () => {
        pbSignOut();

        set({ 
          isAuthenticated: false, 
          user: null,
          isLoading: false,
          registrationState: 'not_started'
        });
      },

      updateProfile: async (profileData: Partial<User>) => {
        
        try {
          set({ isLoading: true});

          const currentUser = get().user;
          if(!currentUser) throw new Error('no user is logged in');

          const pbProfileData: Partial<PBUser> = {};

          if (profileData.username) {
            pbProfileData.username = profileData.username;
          };
          if (profileData.accountType) {
            pbProfileData.accountType = profileData.accountType;
          };
          if (profileData.images) {
            pbProfileData.images = profileData.images;
          };
          if (profileData.bio) {
            pbProfileData.bio = profileData.bio;
          };
          if (profileData.location?.city) {
            pbProfileData.city = profileData.location.city;
          };
          if (profileData.location?.coordinates) {
            pbProfileData.coordinates = profileData.location.coordinates;
          };

          const pbUpdatedUser = await authAPI.updateProfile(currentUser.id, pbProfileData);

          const updatedUser = convertPBUserToUser(pbUpdatedUser);

          set({
            user: updatedUser,
            isLoading: false
          });
          
          get().hydrateUser();
        } catch (error) {
          set({ isLoading: false });
          console.log('authStore updateuser error ', error);
          throw error;
        }
      },

      setRegistrationState: (state: RegistrationState) => {
        set({ registrationState: state });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user,
        registrationState: state.registrationState
      }),
    }
  )
)