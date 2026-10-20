import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventCard } from '@/components/events/EventCard';
import { EVENT_CATEGORIES } from '@/constants/categories';
import { EventCategory } from '@/types';
import { spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function DiscoverScreen() {
  const { events, savedIds, toggleSaved } = useAppData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      const matchesCategory = category === 'all' || e.category === category;
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.venue_name.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [events, query, category]);

  return (
    <Screen padded={false} edges={['top']}>
      <View style={styles.header}>
        <Text variant="title">Discover</Text>
        <Text variant="body" tone="secondary">
          Search sample events by interest, venue, or city.
        </Text>
        <Input
          placeholder="Search events"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.chips}>
            <Chip
              label="All"
              selected={category === 'all'}
              onPress={() => setCategory('all')}
            />
            {EVENT_CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No events match"
            message="Try another category or clear your search."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setCategory('all');
            }}
          />
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            saved={savedIds.includes(item.id)}
            onToggleSave={() => toggleSaved(item.id)}
            onPress={() => router.push(`/event/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.section,
  },
});
