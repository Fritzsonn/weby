import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, radii, spacing } from '@/constants/theme';
import { formatRelative } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';
import { DEMO_USER_ID } from '@/data/sample-users';
import { useAuth } from '@/providers/AuthProvider';

export default function ChatsScreen() {
  const { profile } = useAuth();
  const { conversations } = useAppData();
  const me = profile?.id ?? DEMO_USER_ID;

  return (
    <Screen padded={false} edges={['top']}>
      <View style={styles.header}>
        <Text variant="title">Chats</Text>
        <Text variant="body" tone="secondary">
          Private messages and event group chats.
        </Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No conversations yet"
            message="Add friends or join an event group to start chatting."
            actionLabel="Find friends"
            onAction={() => router.push('/match')}
          />
        }
        renderItem={({ item }) => {
          const other = item.members?.find((m) => m.user_id !== me)?.profile;
          const title =
            item.type === 'event_group'
              ? item.title ?? 'Event group'
              : other?.display_name ?? 'Conversation';
          const subtitle = item.last_message?.body ?? 'Say hello';
          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push(
                  item.type === 'event_group'
                    ? `/chat/group/${item.id}`
                    : `/chat/${item.id}`
                )
              }
            >
              <Avatar
                uri={item.type === 'event_group' ? undefined : other?.avatar_url}
                name={title}
                size="md"
              />
              <View style={styles.meta}>
                <View style={styles.titleRow}>
                  <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                    {title}
                  </Text>
                  {item.last_message_at ? (
                    <Text variant="caption" tone="muted">
                      {formatRelative(item.last_message_at)}
                    </Text>
                  ) : null}
                </View>
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
              {(item.unread_count ?? 0) > 0 ? (
                <View style={styles.unread}>
                  <Text variant="caption" tone="inverse">
                    {item.unread_count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.section,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unread: {
    minWidth: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
});
