import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/providers/AuthProvider';
import { colors, spacing } from '@/constants/theme';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SignupScreen() {
  const { signUpWithPassword } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit() {
    setError(undefined);
    if (!displayName.trim()) {
      setError('Choose a display name.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    if (isSupabaseConfigured && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUpWithPassword(email.trim(), password || 'local-dev', displayName.trim());
      router.replace('/(auth)/profile-setup');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create account.';
      setError(message);
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll gradient edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text variant="label" tone="brand">
          Join Weby
        </Text>
        <Text variant="hero">Create your account</Text>
        <Text variant="body" tone="secondary">
          Friendship-first. You choose what to share.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="How friends will see you"
          autoComplete="name"
        />
        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
        />
        <Input
          label={isSupabaseConfigured ? 'Password' : 'Password (optional in demo)'}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
        />
        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label="Continue"
          fullWidth
          size="lg"
          loading={loading}
          onPress={onSubmit}
        />
      </View>

      <Text variant="caption" tone="muted" style={styles.legal}>
        By continuing you agree to treat others with respect. Weby is not a dating app.
      </Text>

      <Text variant="body" tone="secondary" style={styles.footer}>
        Already have an account?{' '}
        <Link href="/(auth)/login" style={styles.link}>
          Log in
        </Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
  legal: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  link: {
    color: colors.brand,
    fontFamily: 'DMSans_700Bold',
  },
});
