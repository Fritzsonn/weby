import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SettingsScreen() {
  const { signOut, updateProfile, profile } = useAuth();

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <Screen scroll>
        <Text variant="caption" tone="muted" style={styles.note}>
          Push notifications require Expo project credentials and a physical device. See docs/SETUP.md.
        </Text>

        <View style={styles.group}>
          <Row
            icon="shield-checkmark-outline"
            label="Privacy controls"
            onPress={() => router.push('/settings/privacy')}
          />
          <Row
            icon="ban-outline"
            label="Blocked users"
            onPress={() => router.push('/settings/blocked')}
          />
          <Row
            icon="trophy-outline"
            label={`Points & level · ${profile?.points ?? 0} pts · L${profile?.level ?? 1}`}
            onPress={() =>
              Alert.alert(
                'Gamification',
                'Points for profile completion, attendance, meetups, and memories are awarded by backend validation — not client-side alone.'
              )
            }
          />
        </View>

        <View style={styles.group}>
          <Row
            icon="trash-outline"
            label="Delete account"
            onPress={() =>
              Alert.alert(
                'Delete account?',
                isSupabaseConfigured
                  ? 'Account deletion will remove your profile and personal data via a secure backend process. This demo shows the confirmation flow only.'
                  : 'In local demo mode, signing out clears your session. Wire Supabase account deletion before production.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await updateProfile({ onboarding_complete: false });
                      await signOut();
                      router.replace('/(auth)/welcome');
                    },
                  },
                ]
              )
            }
          />
        </View>

        <Button label="Sign out" variant="ghost" fullWidth onPress={() => signOut()} />
      </Screen>
    </>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color={colors.brand} />
        <Text variant="bodyMedium">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  note: {
    marginBottom: spacing.lg,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    paddingRight: spacing.md,
  },
});
