import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, radii, spacing } from '@/constants/theme';
import { formatShortDate } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';

export default function MemoriesScreen() {
  const { events, goingIds, photos } = useAppData();
  const albums = events.filter((e) => goingIds.includes(e.id));

  return (
    <Screen padded={false} edges={['top']}>
      <View style={styles.header}>
        <Text variant="title">Weby Memories</Text>
        <Text variant="body" tone="secondary">
          Shared albums for events you attend. Uploads stay open for 7 days after each event.
        </Text>
      </View>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title="No albums yet"
            message="Mark I’m Going on an event to unlock its shared memory album."
            actionLabel="Discover events"
            onAction={() => router.push('/(tabs)/discover')}
          />
        }
        renderItem={({ item }) => {
          const count = photos.filter((p) => p.event_id === item.id).length;
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/event/${item.id}/album`)}
            >
              <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
              <View style={styles.body}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {formatShortDate(item.starts_at)} · {count} photo{count === 1 ? '' : 's'}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.section,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: 88,
    height: 88,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
});
