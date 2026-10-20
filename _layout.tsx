import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppDataProvider } from '@/providers/AppDataProvider';
import { colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <AppDataProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.brand,
              headerTitleStyle: { color: colors.text },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="event/[id]" />
            <Stack.Screen name="user/[id]" options={{ headerShown: true, title: 'Profile' }} />
            <Stack.Screen name="friends/index" options={{ headerShown: true, title: 'Friends' }} />
            <Stack.Screen name="match/index" options={{ headerShown: true, title: 'Weby Match' }} />
            <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Chat' }} />
            <Stack.Screen name="chat/group/[id]" options={{ headerShown: true, title: 'Event group' }} />
            <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
            <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
            <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: 'Privacy' }} />
            <Stack.Screen name="settings/blocked" options={{ headerShown: true, title: 'Blocked' }} />
          </Stack>
        </AppDataProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
