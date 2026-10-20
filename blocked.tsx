import { FlatList, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { getSampleProfileById } from '@/data/sample-users';
import { colors, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function BlockedUsersScreen() {
  const { blockedIds, unblockUser } = useAppData();
  const blocked = blockedIds
    .map((id) => getSampleProfileById(id))
    .filter(Boolean);

  return (
    <>
      <Stack.Screen options={{ title: 'Blocked users' }} />
      <Screen padded={false}>
        <FlatList
          data={blocked}
          keyExtractor={(item) => item!.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="ban-outline"
              title="No blocked users"
              message="Blocked people can’t message you or appear in Weby Match."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar uri={item!.avatar_url} name={item!.display_name} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item!.display_name}</Text>
                <Text variant="caption" tone="secondary">
                  @{item!.username}
                </Text>
              </View>
              <Button
                label="Unblock"
                size="sm"
                variant="secondary"
                onPress={() => unblockUser(item!.id)}
              />
            </View>
          )}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
