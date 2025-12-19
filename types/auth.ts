
export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  bio?: string;
  location?: {
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
  passwordConfirm: string;
}

export interface ProfileSetupFormData {
  // city: string;
  bio?: string;
  accountType: 'owner' | 'seeker' | 'shelter';
}

export interface ProfileSetupSubmitData extends ProfileSetupFormData {
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type RegistrationState = 'not_started' | 'signed_up' | 'profile_set_up' | 'completed';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  registrationState: RegistrationState;

  init: () => void;  
  signIn: (userData: SignInFormData) => Promise<void>;
  signUp: (userData: SignUpFormData) => Promise<void>;
  signOut: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  setRegistrationState: (state: RegistrationState) => void;
  setLoading: (loading: boolean) => void;
}
