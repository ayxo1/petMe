import { Stack } from "expo-router";
import './globals.css';

export default function RootLayout() {
  return <Stack 
  screenOptions={{ headerShown: false, contentStyle: {backgroundColor: '#f5ea6e'}}}
  />;
}
