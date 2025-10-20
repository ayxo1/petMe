import { useAuthStore } from "@/stores/authStore";
import { getRegistrationStateRoute } from "@/utils/routingHelper";
import { router, Stack, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import './globals.css';

export default function RootLayout() {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const registrationState = useAuthStore(state => state.registrationState);
  const user = useAuthStore(state => state.user);
  
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // if (!rootNavigationState?.key) {
    //   return;
    // }
    console.log(rootNavigationState.key);
    
    // setTimeout(() => {

    // }, 1)
    if (isAuthenticated) {
      const targetRoute = getRegistrationStateRoute(registrationState, user);
      
      router.replace(targetRoute);

      console.log(rootNavigationState.key);
    }
    
  }, [isAuthenticated, registrationState, user]);


  return <Stack
  screenOptions={{ headerShown: false, contentStyle: {backgroundColor: '#f5c66e'}}}
  />;
}