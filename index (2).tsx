import { useMemo, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { colors, radii, shadows, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import { Profile } from '@/types';

export default function MatchScreen() {
  const { getCompatibleMatches, sendFriendRequest, friendIds } = useAppData();
  const matches = useMemo(() => getCompatibleMatches(), [getCompatibleMatches, friendIds]);
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const current = matches[index] as Profile | undefined;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 120) {
          void swipe('right');
        } else if (g.dx < -120) {
          void swipe('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  async function swipe(dir: 'left' | 'right') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(position, {
      toValue: { x: dir === 'right' ? 400 : -400, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(async () => {
      if (dir === 'right' && current) {
        await sendFriendRequest(current.id);
        Alert.alert('Friend request sent', `You connected with ${current.display_name} as a potential friend — not a date.`);
      }
      position.setValue({ x: 0, y: 0 });
      setIndex((i) => i + 1);
    });
  }

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Weby Match' }} />
      <Screen edges={['bottom']}>
        <Text variant="body" tone="secondary" style={styles.lead}>
          Discover potential friends by shared interests. This is never romantic matching.
        </Text>

        {!current ? (
          <EmptyState
            icon="sparkles-outline"
            title="You’re caught up"
            message="Check back after joining more events or updating interests."
            actionLabel="Edit interests"
            onAction={() => router.push('/(tabs)/profile')}
          />
        ) : (
          <>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
              {...pan.panHandlers}
            >
              <Image
                source={{ uri: current.avatar_url ?? undefined }}
                style={styles.image}
                contentFit="cover"
              />
              <View style={styles.body}>
                <Text variant="title">{current.display_name}</Text>
                <Text variant="body" tone="secondary">
                  {current.bio}
                </Text>
                <View style={styles.chips}>
                  {current.interests.slice(0, 4).map((i) => (
                    <Chip key={i} label={i} selected />
                  ))}
                </View>
              </View>
            </Animated.View>

            <View style={styles.actions}>
              <Button label="Skip" variant="ghost" onPress={() => swipe('left')} style={{ flex: 1 }} />
              <Button label="Add friend" onPress={() => swipe('right')} style={{ flex: 1 }} />
            </View>
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  lead: {
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    ...shadows.medium,
    marginBottom: spacing.xl,
  },
  image: {
    height: '58%',
    width: '100%',
  },
  body: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
});
