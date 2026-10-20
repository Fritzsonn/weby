import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, radii, spacing } from '@/constants/theme';
import { formatEventWhen } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { DEMO_USER_ID } from '@/data/sample-users';

export default function MeetupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { meetups, createMeetup, toggleMeetupJoin, goingIds } = useAppData();
  const eventMeetups = meetups.filter((m) => m.event_id === id);
  const canCreate = goingIds.includes(id);

  const [title, setTitle] = useState('');
  const [point, setPoint] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function onCreate() {
    if (!canCreate) {
      Alert.alert('Attendance required', 'Mark I’m Going before creating a meetup.');
      return;
    }
    if (!title.trim() || !point.trim()) {
      Alert.alert('Missing details', 'Add a title and meeting point.');
      return;
    }
    setCreating(true);
    try {
      await createMeetup({
        event_id: id,
        created_by: profile?.id ?? DEMO_USER_ID,
        title: title.trim(),
        description: description.trim() || null,
        meeting_point: point.trim(),
        meets_at: new Date().toISOString(),
        max_attendees: 12,
        creator: profile ?? undefined,
      });
      setTitle('');
      setPoint('');
      setDescription('');
      Alert.alert('Meetup created', 'Others attending this event can join.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={eventMeetups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="body" tone="secondary">
              Suggest a meeting point and time. Precise live location is never shared by default.
            </Text>
            {canCreate ? (
              <View style={styles.form}>
                <Input label="Title" value={title} onChangeText={setTitle} placeholder="Coffee before doors" />
                <Input
                  label="Meeting point"
                  value={point}
                  onChangeText={setPoint}
                  placeholder="Venue lobby / nearby cafe"
                />
                <Input
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional details"
                />
                <Button label="Create meetup" loading={creating} onPress={onCreate} />
              </View>
            ) : (
              <View style={styles.notice}>
                <Text variant="caption" tone="secondary">
                  Mark I’m Going on this event to create or join meetups.
                </Text>
              </View>
            )}
            <Text variant="subtitle" style={styles.section}>
              Suggested meetups
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="navigate-outline"
            title="No meetups yet"
            message="Be the first to suggest a hang before the event."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text variant="bodyMedium">{item.title}</Text>
            <Text variant="caption" tone="secondary">
              {item.meeting_point}
            </Text>
            <Text variant="caption" tone="muted">
              {formatEventWhen(item.meets_at)} · {item.member_count ?? 0} coming
            </Text>
            {item.description ? (
              <Text variant="body" tone="secondary">
                {item.description}
              </Text>
            ) : null}
            <Button
              label={item.is_joined ? 'Leave meetup' : 'Join meetup'}
              variant={item.is_joined ? 'secondary' : 'primary'}
              size="sm"
              onPress={() => {
                if (!canCreate) {
                  Alert.alert('Attendance required', 'Mark I’m Going first.');
                  return;
                }
                void toggleMeetupJoin(item.id);
              }}
              style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    paddingBottom: spacing.section,
    gap: spacing.md,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  notice: {
    padding: spacing.lg,
    backgroundColor: colors.warningSoft,
    borderRadius: radii.lg,
  },
  section: {
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
});
