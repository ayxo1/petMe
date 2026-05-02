import { pb } from "@/backend/config/pocketbase";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { usePetStore } from "@/stores/petStore";
import { useShelterStore } from "@/stores/shelterStore";
import { registerForPushNotifications } from "@/utils/notifications";
import { getRegistrationStateRoute } from "@/utils/routingHelper";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Text } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import './globals.css';

export default function RootLayout() {

  // const [fontsLoaded] = useFonts({
  //   'ReemKufi-Bold': require('@/assets/fonts/ReemKufi-Bold.ttf')
  // });

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const registrationState = useAuthStore(state => state.registrationState);
  const user = useAuthStore(state => state.user);
  const init = useAuthStore(state => state.init);
  const hydrateUser = useAuthStore(state => state.hydrateUser);
  const sessionExpired = useAuthStore(state => state.sessionExpired);
  const hydratePets = usePetStore(state => state.hydratePets);
  const hydrateShelter = useShelterStore(state => state.hydrateShelter);

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
      const freshUser = useAuthStore.getState().user;
      if (freshUser && freshUser.regState === 'completed') {
        hydratePets(freshUser.id);
        if (freshUser?.accountType === 'shelter') hydrateShelter(freshUser.id);
        registerForPushNotifications(freshUser.id);
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
    
  }, [isAuthenticated, registrationState]);
  
  useEffect(() => {
    if (sessionExpired) Alert.alert(
      'session expired',
      'you\'ve been logged in for a bit too long, please re-login to refresh all the data. thanks! :)',
      [{ text: 'ok' }]
    );
    useAuthStore.setState({ sessionExpired: false });
  }, [sessionExpired]);

  return (
    <GestureHandlerRootView>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: {backgroundColor: Colors.primary}}}
      />
      {/* {!fontsLoaded ? (
        <SafeAreaView className="flex-1 flex-row gap-2 items-center justify-center absolute top-48 left-0 right-0">
          <ActivityIndicator size="small" className='color-gray-600/60' />
          <Text className="text-2xl text-gray-600/60 text-center max-w-96">loading</Text>
        </SafeAreaView>
      ) : null} */}
    </GestureHandlerRootView>
  );
};