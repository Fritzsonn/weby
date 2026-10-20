import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SAMPLE_PROFILES, DEMO_PROFILE } from '@/data/sample-users';
import { colors, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function AttendeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goingIds } = useAppData();
  const { profile } = useAuth();
  const going = goingIds.includes(id);

  const attendees = going
    ? [profile ?? DEMO_PROFILE, ...SAMPLE_PROFILES.slice(0, 4)]
    : SAMPLE_PROFILES.slice(0, 3);

  return (
    <Screen padded={false}>
      <View style={styles.note}>
        <Text variant="caption" tone="secondary">
          Attendee visibility respects privacy settings. Sample attendees shown for development.
        </Text>
      </View>
      <FlatList
        data={attendees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No attendees yet"
            message="Be the first to mark I’m Going."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/user/${item.id}`)}
          >
            <Avatar uri={item.avatar_url} name={item.display_name} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{item.display_name}</Text>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {item.interests.slice(0, 3).join(' · ')}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.section,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
