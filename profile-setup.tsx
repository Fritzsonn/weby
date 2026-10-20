import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { INTEREST_OPTIONS, LANGUAGE_OPTIONS } from '@/constants/categories';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileSetupScreen() {
  const { profile, updateProfile, completeOnboarding } = useAuth();
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [languages, setLanguages] = useState<string[]>(profile?.languages ?? ['English']);
  const [loading, setLoading] = useState(false);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function onFinish() {
    setLoading(true);
    try {
      await updateProfile({
        bio: bio.trim() || null,
        city: city.trim() || null,
        interests,
        languages,
      });
      await completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']} padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="label" tone="brand">
          Profile setup
        </Text>
        <Text variant="hero">Tell people what you share</Text>
        <Text variant="body" tone="secondary" style={styles.lead}>
          Only what you choose here is visible. You can change privacy anytime in Settings.
        </Text>

        <Input
          label="Short bio"
          value={bio}
          onChangeText={setBio}
          placeholder="A sentence about how you like to meet people"
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Where you usually go to events"
        />

        <Text variant="bodyMedium" style={styles.section}>
          Interests
        </Text>
        <View style={styles.chips}>
          {INTEREST_OPTIONS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={interests.includes(item)}
              onPress={() => toggle(interests, item, setInterests)}
            />
          ))}
        </View>

        <Text variant="bodyMedium" style={styles.section}>
          Languages
        </Text>
        <View style={styles.chips}>
          {LANGUAGE_OPTIONS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={languages.includes(item)}
              onPress={() => toggle(languages, item, setLanguages)}
            />
          ))}
        </View>

        <Button
          label="Enter Weby"
          fullWidth
          size="lg"
          loading={loading}
          onPress={onFinish}
          style={styles.cta}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.section,
    gap: spacing.md,
  },
  lead: {
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cta: {
    marginTop: spacing.xl,
  },
});
