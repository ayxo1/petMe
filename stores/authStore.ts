import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthState, RegistrationState, SignInFormData, SignUpFormData, User } from '../types/auth';
import { usePetStore } from './petStore';

const authAPI = {
  signIn: async ({email, password}: SignInFormData): Promise<User> => {

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Math.random().toString(),
      email,
      username: email.split('@')[0],
      accountType: 'owner',
      createdAt: new Date().toISOString(),
    }
  },

  signUp: async ({email, username}: SignUpFormData): Promise<User> => {

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Math.random().toString(),
      email,
      username,
      createdAt: new Date().toISOString(),
    }
  },

  updateProfile: async (userId: string, profileData: Partial<User>): Promise<User> => {
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUser = useAuthStore.getState().user;

    if(!currentUser || currentUser.id !== userId) throw new Error('user not found');

    const updatedUser: User = {
      ...currentUser,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    return updatedUser;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Init state
      isAuthenticated: false,
      user: null,
      isLoading: false,
      registrationState: 'not_started',

      signIn: async (userData: SignInFormData) => {
        try {
          set({ isLoading: true });
          const user = await authAPI.signIn(userData);
          set({ 
            isAuthenticated: true, 
            user,
            isLoading: false,
          });

          await usePetStore.getState().hydratePets(user.id);

        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signUp: async (userData: SignUpFormData) => {
        try {
          set({ isLoading: true })
          
          const newUser = await authAPI.signUp(userData);
          
          set({ 
            isAuthenticated: true, 
            user: newUser,
            isLoading: false,
          });
          
          await usePetStore.setState({ pets: [], isHydrated: true });
        } catch (error) {
          set({ isLoading: false })
          throw error;
        }
      },

      signOut: () => {
        set({ 
          isAuthenticated: false, 
          user: null,
          isLoading: false,
        })
      },

      updateProfile: async (profileData: Partial<User>) => {
        try {
          set({ isLoading: true});

          const currentUser = get().user;
          if(!currentUser) throw new Error('no user is logged in');

          const updatedUser = await authAPI.updateProfile(currentUser.id, profileData);

          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
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