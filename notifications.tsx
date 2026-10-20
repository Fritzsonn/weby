import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, radii, spacing } from '@/constants/theme';
import { formatRelative } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useAppData();

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Screen padded={false}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="You're all caught up"
              message="Friend requests, group opens, and meetup updates will appear here."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, !item.read_at && styles.unread]}
              onPress={() => {
                void markNotificationRead(item.id);
                if (item.type === 'friend_request') router.push('/friends');
                if (item.type === 'group_open' && item.data?.conversation_id) {
                  router.push(`/chat/group/${String(item.data.conversation_id)}`);
                }
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.title}</Text>
                <Text variant="caption" tone="secondary">
                  {item.body}
                </Text>
                <Text variant="caption" tone="muted">
                  {formatRelative(item.created_at)}
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
  },
  row: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
});
