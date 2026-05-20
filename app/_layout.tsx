import { pb } from "@/backend/config/pocketbase";
import Colors from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { usePetStore } from "@/stores/petStore";
import { useShelterStore } from "@/stores/shelterStore";
import { registerForPushNotifications } from "@/utils/notifications";
import { getRegistrationStateRoute } from "@/utils/routingHelper";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './globals.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // const [fontsLoaded] = useFonts({
  //   'ReemKufi-Bold': require('@/assets/fonts/ReemKufi-Bold.ttf')
  // });
  const [animationFinished, setAnimationFinished] = useState(false);

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
      await SplashScreen.hideAsync();

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

  useEffect(() => {
    const timeout = setTimeout(() => setAnimationFinished(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <GestureHandlerRootView>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: {backgroundColor: Colors.primary}}}
      />
      {!animationFinished ? (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#fdf0dc',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <LottieView
            source={require('@/assets/animations/splashScreenAnim.json')}
            autoPlay
            // loop={true}
            style={{ width: '50%', height: '50%' }}
            onAnimationFinish={() => setAnimationFinished(true)}
          />
        </View>
      ) : null}
      {/* {!fontsLoaded ? (
        <SafeAreaView className="flex-1 flex-row gap-2 items-center justify-center absolute top-48 left-0 right-0">
          <ActivityIndicator size="small" className='color-gray-600/60' />
          <Text className="text-2xl text-gray-600/60 text-center max-w-96">loading</Text>
        </SafeAreaView>
      ) : null} */}
    </GestureHandlerRootView>
  );
};