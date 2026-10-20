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

export default function LoginScreen() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit() {
    setError(undefined);
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
      await signInWithPassword(email.trim(), password || 'local-dev');
      router.replace('/');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not sign in.';
      setError(message);
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll gradient edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text variant="label" tone="brand">
          Welcome back
        </Text>
        <Text variant="hero">Log in to Weby</Text>
        <Text variant="body" tone="secondary">
          {isSupabaseConfigured
            ? 'Sign in with your Weby account.'
            : 'Local demo mode — enter any email to continue. Add Supabase keys to enable real auth.'}
        </Text>
      </View>

      <View style={styles.form}>
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
          placeholder="••••••••"
        />
        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : null}
        <Button label="Log in" fullWidth size="lg" loading={loading} onPress={onSubmit} />
      </View>

      <Text variant="body" tone="secondary" style={styles.footer}>
        New here?{' '}
        <Link href="/(auth)/signup" style={styles.link}>
          Create an account
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
  footer: {
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  link: {
    color: colors.brand,
    fontFamily: 'DMSans_700Bold',
  },
});
