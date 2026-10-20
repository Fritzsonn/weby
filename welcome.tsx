import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, radii, spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80',
          }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(10,40,40,0.15)', 'rgba(10,40,40,0.72)', '#0A4F4F']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.brandBlock, { opacity: fade, transform: [{ translateY: rise }] }]}>
          <Text variant="label" tone="inverse" style={styles.taglineLabel}>
            Weby
          </Text>
          <Text variant="display" tone="inverse" style={styles.brand}>
            Weby
          </Text>
          <Text variant="subtitle" tone="inverse" style={styles.tagline}>
            Meet your people before the moment.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.sheet}>
        <Text variant="body" tone="secondary" style={styles.copy}>
          A friendship-first social app for real-world events — discover gatherings,
          join group chats early, and make memories together.
        </Text>
        <Button
          label="Get started"
          fullWidth
          size="lg"
          onPress={() => router.push('/(auth)/onboarding')}
        />
        <Button
          label="I already have an account"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1.15,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  brandBlock: {
    gap: spacing.sm,
  },
  taglineLabel: {
    opacity: 0.85,
    letterSpacing: 2,
  },
  brand: {
    fontSize: 52,
  },
  tagline: {
    maxWidth: 280,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  copy: {
    marginBottom: spacing.sm,
  },
});
