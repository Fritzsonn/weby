import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops', headerShown: true }} />
      <Screen>
        <Text variant="title">Screen not found</Text>
        <Link href="/" style={styles.link}>
          <Text variant="body" tone="brand">
            Go home
          </Text>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: spacing.lg,
    color: colors.brand,
  },
});
