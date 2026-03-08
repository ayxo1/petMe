import { pb } from "@/backend/config/pocketbase";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { usePetStore } from "@/stores/petStore";
import { getRegistrationStateRoute } from "@/utils/routingHelper";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './globals.css';

export default function RootLayout() {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const registrationState = useAuthStore(state => state.registrationState);
  const user = useAuthStore(state => state.user);
  const init = useAuthStore(state => state.init);
  const hydrateUser = useAuthStore(state => state.hydrateUser);
  const sessionExpired = useAuthStore(state => state.sessionExpired);
  const hydratePets = usePetStore(state => state.hydratePets);

  useEffect(() => {
    const startUp = async () => {
      await init();
      if (!pb.authStore.isValid) return;
      try {
        await pb.collection('users').authRefresh();
      } catch (error) {
        console.log('auth refresh failed:', error);
        return;
      }
      try {
        await hydrateUser();
      } catch (error) {
        console.log('root layout, hydrateUser error:', error);
      }
      if (user) {
        hydratePets(user.id);
      }
    };
    startUp();
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      const targetRoute = getRegistrationStateRoute(registrationState, user);
      
      requestAnimationFrame(() => {
        router.replace(targetRoute);
      });
    } else {
      requestAnimationFrame(() => {
        router.replace('/(auth)/signin');
      });
    }
    
  }, [isAuthenticated, registrationState, user]);
  
  useEffect(() => {
    if (sessionExpired) Alert.alert(
      'session expired',
      'you\'ve been logged in for a bit too long, please re-login to refresh all the data. thanks! :)',
      [{ text: 'ok' }]
    );
  }, [sessionExpired])

  return (
    <GestureHandlerRootView>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: {backgroundColor: Colors.primary}}}
      />
    </GestureHandlerRootView>
  );
}