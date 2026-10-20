import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, radii, spacing } from '@/constants/theme';
import { countdownLabel, formatEventWhen } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';
import { EVENT_CATEGORIES } from '@/constants/categories';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    events,
    goingIds,
    savedIds,
    toggleGoing,
    toggleSaved,
    meetups,
  } = useAppData();

  const event = events.find((e) => e.id === id);
  if (!event) {
    return (
      <Screen>
        <ErrorState title="Event not found" message="This sample event is unavailable." />
      </Screen>
    );
  }

  const going = goingIds.includes(event.id);
  const saved = savedIds.includes(event.id);
  const category = EVENT_CATEGORIES.find((c) => c.id === event.category);
  const meetupCount = meetups.filter((m) => m.event_id === event.id).length;
  const days = countdownLabel(event.starts_at);

  return (
    <>
      <Stack.Screen options={{ title: event.title, headerTransparent: true, headerTintColor: '#fff' }} />
      <Screen scroll padded={false} edges={[]}>
        <View style={styles.hero}>
          <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'rgba(10,30,30,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: category?.color ?? colors.brand }]}>
                <Text variant="caption" tone="inverse">
                  {category?.label}
                </Text>
              </View>
              {event.source === 'sample' ? (
                <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                  <Text variant="caption" tone="inverse">
                    Sample event
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="hero" tone="inverse">
              {event.title}
            </Text>
            <Text variant="body" tone="inverse">
              {days}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaCard}>
            <Meta icon="calendar-outline" label={formatEventWhen(event.starts_at)} />
            <Meta icon="location-outline" label={`${event.venue_name} · ${event.address}`} />
            <Meta icon="business-outline" label={event.city} />
          </View>

          <Text variant="subtitle">About</Text>
          <Text variant="body" tone="secondary" style={styles.desc}>
            {event.description}
          </Text>

          <View style={styles.actions}>
            <Button
              label={going ? 'Cancel attendance' : "I'm Going"}
              variant={going ? 'secondary' : 'primary'}
              fullWidth
              onPress={() => {
                void toggleGoing(event.id);
                if (!going) {
                  Alert.alert(
                    "You're going!",
                    'Group chat will open 14 days before the event for eligible attendees (backend-controlled).'
                  );
                }
              }}
            />
            <Button
              label={saved ? 'Saved' : 'Save event'}
              variant="ghost"
              fullWidth
              onPress={() => toggleSaved(event.id)}
            />
          </View>

          <View style={styles.links}>
            <LinkRow
              icon="people-outline"
              title="See attendees"
              subtitle="People who marked I’m Going"
              onPress={() => router.push(`/event/${event.id}/attendees`)}
            />
            <LinkRow
              icon="navigate-outline"
              title="Meetup planning"
              subtitle={`${meetupCount} meetup${meetupCount === 1 ? '' : 's'} suggested`}
              onPress={() => router.push(`/event/${event.id}/meetup`)}
            />
            <LinkRow
              icon="images-outline"
              title="Weby Memories"
              subtitle="Shared album for attendees"
              onPress={() => router.push(`/event/${event.id}/album`)}
            />
            {going ? (
              <LinkRow
                icon="chatbubbles-outline"
                title="Event group chat"
                subtitle="Opens 14 days before · eligible attendees only"
                onPress={() => router.push('/chat/group/conv-group-01')}
              />
            ) : null}
          </View>
        </View>
      </Screen>
    </>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={18} color={colors.brand} />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
    </View>
  );
}

function LinkRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={20} color={colors.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{title}</Text>
        <Text variant="caption" tone="secondary">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 320,
    justifyContent: 'flex-end',
  },
  heroContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: -spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  desc: {
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  links: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
