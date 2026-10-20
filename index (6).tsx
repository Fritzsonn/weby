import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { parseISO } from 'date-fns';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { EventCard } from '@/components/events/EventCard';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useAppData } from '@/providers/AppDataProvider';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { events, goingIds, savedIds, notifications, toggleSaved } = useAppData();

  const upcomingGoing = useMemo(
    () =>
      events
        .filter((e) => goingIds.includes(e.id))
        .sort((a, b) => +parseISO(a.starts_at) - +parseISO(b.starts_at)),
    [events, goingIds]
  );

  const recommended = useMemo(() => {
    const interests = new Set(profile?.interests ?? []);
    return [...events]
      .map((e) => ({
        event: e,
        score: e.tags.filter((t) =>
          [...interests].some((i) => i.toLowerCase().includes(t) || t.includes(i.toLowerCase().split(' ')[0]))
        ).length,
      }))
      .sort((a, b) => b.score - a.score || +parseISO(a.event.starts_at) - +parseISO(b.event.starts_at))
      .map((x) => x.event)
      .slice(0, 6);
  }, [events, profile?.interests]);

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <Screen padded={false} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="caption" tone="secondary">
              Good to see you
            </Text>
            <Text variant="title">{profile?.display_name ?? 'Friend'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Weby Match"
              onPress={() => router.push('/match')}
              style={styles.iconBtn}
            >
              <Ionicons name="people-circle-outline" size={24} color={colors.brand} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              style={styles.iconBtn}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unread > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
          </View>
        </View>

        <View style={styles.banner}>
          <Text variant="label" tone="inverse">
            Friendship first
          </Text>
          <Text variant="subtitle" tone="inverse">
            Meet your people before the moment.
          </Text>
          <Text variant="caption" tone="inverse" style={styles.bannerCopy}>
            Sample events below are for development — not live listings.
          </Text>
        </View>

        <View style={styles.sectionHead}>
          <Text variant="subtitle">Your upcoming</Text>
          <Pressable onPress={() => router.push('/(tabs)/discover')}>
            <Text variant="caption" tone="brand">
              Discover more
            </Text>
          </Pressable>
        </View>
        {upcomingGoing.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text variant="body" tone="secondary">
              Mark I’m Going on an event to see it here and unlock group chats 14 days before.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {upcomingGoing.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                compact
                saved={savedIds.includes(event.id)}
                onToggleSave={() => toggleSaved(event.id)}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHead}>
          <Text variant="subtitle">Recommended for you</Text>
        </View>
        <View style={styles.stack}>
          {recommended.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              saved={savedIds.includes(event.id)}
              onToggleSave={() => toggleSaved(event.id)}
              onPress={() => router.push(`/event/${event.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.section,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  banner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.brandDark,
    gap: spacing.xs,
  },
  bannerCopy: {
    opacity: 0.85,
    marginTop: spacing.xs,
  },
  sectionHead: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  stack: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  emptyBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
  },
});
