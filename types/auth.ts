
export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  bio?: string;
  location?: {
    city: string;
    coordinates?: { lat: number; lng: number; };
  }
  accountType?: 'owner' | 'seeker' | 'shelter';
  createdAt: string;
  updatedAt?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  username: string;
}

export interface ProfileSetupFormData {
  city: string;
  bio?: string;
  accountType: 'owner' | 'seeker' | 'shelter';
  
}

export interface ProfileSetupSubmitData extends ProfileSetupFormData {
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  
  signIn: (userData: SignInFormData) => Promise<void>;
  signUp: (userData: SignUpFormData) => Promise<void>;
  signOut: () => void;
  updateProfile: (userId: string, profileData: Partial<User>) => Promise<void>;
  setLoading: (loading: boolean) => void;
}
