import { Switch, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function PrivacySettingsScreen() {
  const { profile, updateProfile } = useAuth();

  if (!profile) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy' }} />
      <Screen scroll>
        <Text variant="body" tone="secondary" style={styles.lead}>
          Only information you enable here is shown on your profile.
        </Text>

        <View style={styles.card}>
          <Toggle
            label="Show age"
            value={profile.show_age}
            onChange={(show_age) => updateProfile({ show_age })}
          />
          <Toggle
            label="Show city"
            value={profile.show_city}
            onChange={(show_city) => updateProfile({ show_city })}
          />
          <Toggle
            label="Show upcoming events"
            value={profile.show_upcoming_events}
            onChange={(show_upcoming_events) => updateProfile({ show_upcoming_events })}
          />
          <Toggle
            label="Allow friend requests"
            value={profile.allow_friend_requests}
            onChange={(allow_friend_requests) => updateProfile({ allow_friend_requests })}
          />
        </View>

        <Text variant="caption" tone="muted">
          Age-appropriate safety: users must meet your product’s minimum age policy before
          signup. Enforce age checks in Supabase auth hooks before production launch.
        </Text>
      </Screen>
    </>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.brand, false: colors.borderStrong }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lead: {
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
