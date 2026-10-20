import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Text } from '@/components/ui/Text';
import { colors, radii, shadows, spacing } from '@/constants/theme';
import { Event } from '@/types';
import { EVENT_CATEGORIES } from '@/constants/categories';

export function EventCard({
  event,
  onPress,
  compact = false,
  saved = false,
  onToggleSave,
}: {
  event: Event;
  onPress?: () => void;
  compact?: boolean;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const category = EVENT_CATEGORIES.find((c) => c.id === event.category);
  const starts = parseISO(event.starts_at);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageWrap, compact && styles.imageCompact]}>
        <Image
          source={{ uri: event.image_url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
        />
        <LinearGradient
          colors={['transparent', 'rgba(10,30,30,0.72)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: category?.color ?? colors.brand }]}>
            <Text variant="caption" tone="inverse">
              {category?.label ?? event.category}
            </Text>
          </View>
          {event.source === 'sample' ? (
            <View style={[styles.badge, styles.sampleBadge]}>
              <Text variant="caption" tone="inverse">
                Sample
              </Text>
            </View>
          ) : null}
        </View>
        {onToggleSave ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Unsave event' : 'Save event'}
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleSave();
            }}
            style={styles.saveBtn}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={colors.textInverse}
            />
          </Pressable>
        ) : null}
        {!compact ? (
          <View style={styles.imageFooter}>
            <Text variant="subtitle" tone="inverse" numberOfLines={2}>
              {event.title}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        {compact ? (
          <Text variant="bodyMedium" numberOfLines={2}>
            {event.title}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary">
            {format(starts, 'EEE, MMM d · h:mm a')}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {event.venue_name} · {event.city}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  compact: {
    width: 260,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    height: 180,
    position: 'relative',
  },
  imageCompact: {
    height: 140,
  },
  badges: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  sampleBadge: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  saveBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFooter: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
