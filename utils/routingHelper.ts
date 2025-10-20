import { RegistrationState, User } from "@/types/auth";

interface RegistrationStateRoutes {
    'not_started': '/(auth)/signin',
    'signed_up': '/(auth)/profile-setup',
    'profile_set_up': '/' | '/(auth)/pet-setup',
    'completed': '/'
};

type RegistrationRoute = RegistrationStateRoutes[keyof RegistrationStateRoutes];

export const getRegistrationStateRoute = (
    registrationState: RegistrationState,
    user: User | null
): RegistrationRoute => {
    const registrationStateRoute: RegistrationStateRoutes = {
        'not_started': '/(auth)/signin',
        'signed_up': '/(auth)/profile-setup',
        'profile_set_up': user?.accountType === 'seeker' ? '/' : '/(auth)/pet-setup',
        'completed': '/'
    }
    return registrationStateRoute[registrationState] || '/';
};

export const isRegistering = (state: RegistrationState): boolean => {
    return state !== 'not_started' && state !== 'completed';
};