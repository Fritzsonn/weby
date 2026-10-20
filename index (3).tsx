import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { getSampleProfileById } from '@/data/sample-users';
import { colors, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function FriendsScreen() {
  const { friendIds, friendRequests, respondFriendRequest } = useAppData();
  const pending = friendRequests.filter((r) => r.status === 'pending');
  const friends = friendIds
    .map((id) => getSampleProfileById(id))
    .filter(Boolean);

  return (
    <>
      <Stack.Screen options={{ title: 'Friends' }} />
      <Screen padded={false}>
        <FlatList
          data={friends}
          keyExtractor={(item) => item!.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text variant="subtitle">Requests</Text>
              {pending.length === 0 ? (
                <Text variant="caption" tone="muted" style={{ marginBottom: spacing.lg }}>
                  No pending requests
                </Text>
              ) : (
                pending.map((req) => (
                  <View key={req.id} style={styles.request}>
                    <Avatar
                      uri={req.from_profile?.avatar_url}
                      name={req.from_profile?.display_name ?? 'User'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">
                        {req.from_profile?.display_name ?? 'Someone'}
                      </Text>
                      {req.message ? (
                        <Text variant="caption" tone="secondary">
                          {req.message}
                        </Text>
                      ) : null}
                      <View style={styles.reqActions}>
                        <Button
                          label="Accept"
                          size="sm"
                          onPress={() => respondFriendRequest(req.id, true)}
                        />
                        <Button
                          label="Decline"
                          size="sm"
                          variant="ghost"
                          onPress={() => respondFriendRequest(req.id, false)}
                        />
                      </View>
                    </View>
                  </View>
                ))
              )}
              <Text variant="subtitle">Friends</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No friends yet"
              message="Use Weby Match or event attendees to connect."
              actionLabel="Open Weby Match"
              onAction={() => router.push('/match')}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push(`/user/${item!.id}`)}
            >
              <Avatar uri={item!.avatar_url} name={item!.display_name} />
              <View>
                <Text variant="bodyMedium">{item!.display_name}</Text>
                <Text variant="caption" tone="secondary">
                  @{item!.username}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    paddingBottom: spacing.section,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  request: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  reqActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
