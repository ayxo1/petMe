
export interface User {
  id: string
  email: string
  username: string
  createdAt?: string
  profileImage?: string
  bio?: string
  location?: string
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  username: string;
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  
  signIn: (userData: User) => void
  signOut: () => void
  signUp: (userData: SignUpFormData) => Promise<void>
  setLoading: (loading: boolean) => void
}
