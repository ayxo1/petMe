
export interface User {
  id: string;
  email: string;
  username: string;
  images: string[];
  bio: string;
  location: {
    coordinates?: { lat: number; lng: number; };
    city: string;
  }
  accountType?: 'owner' | 'seeker' | 'shelter';
  regState: RegistrationState;
  preferences: {
    searchDistance: number;
    showRescuePets: boolean;
    showShelterPets: boolean;
    preferredSpecies: string[];
    showSeekers: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  // username: string;
  passwordConfirm: string;
  regState?: RegistrationState;
  preferences?: {
    searchDistance: number;
    showRescuePets: boolean;
    showShelterPets: boolean;
    showSeekers: boolean;
    preferredSpecies: string[];
  };
}

export interface ProfileSetupFormData {
  username: string;
  images: string[];
  bio?: string;
  accountType: 'owner' | 'seeker' | 'shelter';
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
}

export type RegistrationState = 'not_started' | 'signed_up' | 'verified' | 'profile_set_up' | 'completed';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  registrationState: RegistrationState;
  sessionExpired: boolean;

  init: () => Promise<void>;
  hydrateUser: () => Promise<void>;
  signIn: (userData: SignInFormData) => Promise<void>;
  signUp: (userData: SignUpFormData) => Promise<void>;
  signOut: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  setRegistrationState: (state: RegistrationState) => void;
  setLoading: (loading: boolean) => void;
}

export interface ShelterProfile {
  id: string;
  owner: string;
  name: string;
  image: string;
  description: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
}