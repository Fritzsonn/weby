import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useAppData } from '@/providers/AppDataProvider';

export default function ProfileScreen() {
  const { profile, signOut, mode } = useAuth();
  const { friendIds, goingIds } = useAppData();

  if (!profile) {
    return (
      <Screen>
        <Text>Not signed in</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.header}>
        <Avatar uri={profile.avatar_url} name={profile.display_name} size="xl" />
        <Text variant="title">{profile.display_name}</Text>
        <Text variant="caption" tone="secondary">
          @{profile.username}
        </Text>
        {profile.bio ? (
          <Text variant="body" tone="secondary" style={styles.bio}>
            {profile.bio}
          </Text>
        ) : null}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text variant="subtitle">{profile.points}</Text>
            <Text variant="caption" tone="muted">
              points
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="subtitle">{profile.level}</Text>
            <Text variant="caption" tone="muted">
              level
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="subtitle">{friendIds.length}</Text>
            <Text variant="caption" tone="muted">
              friends
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="subtitle">{goingIds.length}</Text>
            <Text variant="caption" tone="muted">
              going
            </Text>
          </View>
        </View>
      </View>

      <Text variant="bodyMedium" style={styles.section}>
        Interests
      </Text>
      <View style={styles.chips}>
        {profile.interests.map((i) => (
          <Chip key={i} label={i} selected />
        ))}
      </View>

      <View style={styles.menu}>
        <MenuRow
          icon="people-outline"
          label="Friends & requests"
          onPress={() => router.push('/friends')}
        />
        <MenuRow
          icon="sparkles-outline"
          label="Weby Match"
          onPress={() => router.push('/match')}
        />
        <MenuRow
          icon="settings-outline"
          label="Settings & privacy"
          onPress={() => router.push('/settings')}
        />
      </View>

      <Text variant="caption" tone="muted" style={styles.mode}>
        Auth mode: {mode === 'supabase' ? 'Supabase' : 'Local demo'}
      </Text>

      <Button label="Sign out" variant="ghost" fullWidth onPress={() => signOut()} />
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color={colors.brand} />
        <Text variant="bodyMedium">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  bio: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
  },
  stat: {
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mode: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
