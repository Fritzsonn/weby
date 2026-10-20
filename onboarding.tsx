import { useRef, useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, radii, spacing } from '@/constants/theme';

const SLIDES = [
  {
    key: '1',
    icon: 'calendar-outline' as const,
    title: 'Find events worth showing up for',
    body: 'Browse curated gatherings by interest, then mark I’m Going so friends can find you.',
  },
  {
    key: '2',
    icon: 'chatbubbles-outline' as const,
    title: 'Meet people before the doors open',
    body: 'Event group chats unlock 14 days early for attendees — icebreakers included, romance not invited.',
  },
  {
    key: '3',
    icon: 'images-outline' as const,
    title: 'Keep the night as Weby Memories',
    body: 'Share photos with attendees, plan simple meetups, and build friendships that outlast one night.',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Screen edges={['top', 'bottom']} gradient>
      <View style={styles.top}>
        <Text variant="label" tone="brand">
          Welcome to Weby
        </Text>
        <Button
          label="Skip"
          variant="ghost"
          size="sm"
          onPress={() => router.replace('/(auth)/signup')}
        />
      </View>

      <Animated.FlatList
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: width - spacing.xl * 2 }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={36} color={colors.brand} />
            </View>
            <Text variant="hero">{item.title}</Text>
            <Text variant="body" tone="secondary">
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label={index === SLIDES.length - 1 ? 'Create account' : 'Continue'}
          fullWidth
          size="lg"
          onPress={() => {
            if (index === SLIDES.length - 1) {
              router.push('/(auth)/signup');
            } else {
              setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
            }
          }}
        />
        <Button
          label="Log in"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  slide: {
    gap: spacing.lg,
    paddingTop: spacing.section,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.brand,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
