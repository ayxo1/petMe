import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { getRegistrationStateRoute } from "@/utils/routingHelper";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './globals.css';

export default function RootLayout() {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const registrationState = useAuthStore(state => state.registrationState);
  const user = useAuthStore(state => state.user);
  const init = useAuthStore(state => state.init);
  const hydrateUser = useAuthStore(state => state.hydrateUser);

  useEffect(() => {
    init();
    hydrateUser();
  }, [])
  
  useEffect(() => {
    if (isAuthenticated) {
      const targetRoute = getRegistrationStateRoute(registrationState, user);
      
      requestAnimationFrame(() => {
        router.replace(targetRoute);
      });
    };
    
  }, [isAuthenticated, registrationState, user]);


  return (
    <GestureHandlerRootView>
      <Stack
      screenOptions={{ headerShown: false, contentStyle: {backgroundColor: Colors.primary}}}
      />
    </GestureHandlerRootView>
  );
}