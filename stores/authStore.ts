import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthState, SignUpFormData, User } from '../types/auth';

const authAPI = {
  signIn: async (email: string, password: string): Promise<User> => {

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Math.random().toString(),
      email,
      username: email.split('@')[0],
      createdAt: new Date().toISOString(),
    }
  },

  signUp: async (data: SignUpFormData): Promise<User> => {

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Math.random().toString(),
      email: data.email,
      username: data.username,
      createdAt: new Date().toISOString(),
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Init state
      isAuthenticated: false,
      user: null,
      isLoading: false,

      signIn: (userData: User) => {
        set({ 
          isAuthenticated: true, 
          user: userData,
          isLoading: false
        })
      },

      signUp: async (userData: SignUpFormData) => {
        try {
          set({ isLoading: true })
          
          const newUser = await authAPI.signUp(userData);
          
          set({ 
            isAuthenticated: true, 
            user: newUser,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error;
        }
      },

      signOut: () => {
        set({ 
          isAuthenticated: false, 
          user: null,
          isLoading: false
        })
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
        user: state.user 
      }),
    }
  )
)