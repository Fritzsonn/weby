import { Redirect } from 'expo-router';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
  const { ready, isAuthenticated, profile } = useAuth();

  if (!ready) return <LoadingState message="Starting Weby…" />;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (profile && !profile.onboarding_complete) {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
