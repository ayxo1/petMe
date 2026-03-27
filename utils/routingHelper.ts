import { RegistrationState, User } from "@/types/auth";

interface RegistrationStateRoutes {
    'not_started': '/(auth)/signin';
    'signed_up': '/(auth)/pin-entry';
    'verified': '/(auth)/profile-setup';
    'profile_set_up': '/' | '/(auth)/pet-setup' | '/(auth)/shelter-setup';
    'completed': '/';
}

type RegistrationRoute = RegistrationStateRoutes[keyof RegistrationStateRoutes];

export const getRegistrationStateRoute = (
    registrationState: RegistrationState,
    user: User | null
): RegistrationRoute => {
    const registrationStateRoute: RegistrationStateRoutes = {
        'not_started': '/(auth)/signin',
        'signed_up': '/(auth)/pin-entry',
        'verified': '/(auth)/profile-setup',
        'profile_set_up': user?.accountType === 'seeker' ? '/' : (user?.accountType === 'owner' ? '/(auth)/pet-setup' : '/(auth)/shelter-setup'),
        'completed': '/'
    }
    return registrationStateRoute[registrationState] || '/';
};

export const isRegistering = (state: RegistrationState): boolean => {
    return state !== 'not_started' && state !== 'completed';
};