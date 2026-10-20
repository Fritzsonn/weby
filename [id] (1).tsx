import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ICEBREAKER_QUESTIONS } from '@/constants/categories';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { countdownLabel, formatRelative } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { DEMO_USER_ID } from '@/data/sample-users';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const {
    conversations,
    messagesByConversation,
    sendMessage,
    markConversationRead,
    events,
    goingIds,
  } = useAppData();
  const [draft, setDraft] = useState('');
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({
    Coffee: 4,
    Tea: 2,
    Neither: 1,
  });
  const me = profile?.id ?? DEMO_USER_ID;
  const conversation = conversations.find((c) => c.id === id);
  const messages = messagesByConversation[id] ?? [];
  const event = events.find((e) => e.id === conversation?.event_id);
  const eligible = event ? goingIds.includes(event.id) : false;

  useEffect(() => {
    void markConversationRead(id);
  }, [id, markConversationRead]);

  if (!eligible) {
    return (
      <Screen>
        <Text variant="subtitle">Group chat locked</Text>
        <Text variant="body" tone="secondary" style={{ marginVertical: spacing.md }}>
          Only attendees who marked I’m Going can join. Group creation and open time are
          controlled by secure backend jobs — not your phone clock.
        </Text>
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: conversation?.title ?? 'Event group' }} />
      <Screen padded={false} edges={['bottom']}>
        <View style={styles.banner}>
          <Text variant="bodyMedium" tone="inverse">
            {event?.title ?? 'Event'}
          </Text>
          <Text variant="caption" tone="inverse">
            {event ? countdownLabel(event.starts_at) : 'Countdown'} · ~20–30 friends max
          </Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={88}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.tools}>
                <Text variant="caption" tone="muted">
                  Icebreaker
                </Text>
                <Text variant="bodyMedium">{ICEBREAKER_QUESTIONS[0]}</Text>
                <View style={styles.poll}>
                  <Text variant="caption" tone="secondary">
                    Quick poll · Coffee or tea before we go in?
                  </Text>
                  {Object.entries(pollVotes).map(([option, votes]) => (
                    <Pressable
                      key={option}
                      style={styles.pollOption}
                      onPress={() =>
                        setPollVotes((prev) => ({ ...prev, [option]: prev[option] + 1 }))
                      }
                    >
                      <Text variant="body">{option}</Text>
                      <Text variant="caption" tone="brand">
                        {votes}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.safety}>
                  <Button
                    label="Leave group"
                    size="sm"
                    variant="ghost"
                    onPress={() =>
                      Alert.alert('Left group', 'You can rejoin if still eligible before the event.')
                    }
                  />
                  <Button
                    label="Report"
                    size="sm"
                    variant="ghost"
                    onPress={() =>
                      Alert.alert(
                        'Report received',
                        'Content reports are reviewed by human moderators.'
                      )
                    }
                  />
                </View>
              </View>
            }
            renderItem={({ item }) => {
              const mine = item.sender_id === me;
              const system = item.message_type !== 'text';
              if (system) {
                return (
                  <View style={styles.system}>
                    <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                      {item.body}
                    </Text>
                  </View>
                );
              }
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  {!mine ? (
                    <Text variant="caption" tone="brand">
                      {item.sender?.display_name ?? 'Member'}
                    </Text>
                  ) : null}
                  <Text variant="body" tone={mine ? 'inverse' : 'default'}>
                    {item.body}
                  </Text>
                  <Text variant="caption" tone={mine ? 'inverse' : 'muted'}>
                    {formatRelative(item.created_at)}
                  </Text>
                </View>
              );
            }}
          />
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Say hello to the group…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              disabled={!draft.trim()}
              onPress={async () => {
                const body = draft.trim();
                if (!body) return;
                setDraft('');
                await sendMessage(id, body);
              }}
              style={[styles.send, !draft.trim() && { opacity: 0.4 }]}
            >
              <Ionicons name="send" size={18} color={colors.textInverse} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.brandDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: 2,
  },
  list: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  tools: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.xl,
  },
  poll: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pollOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  safety: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  system: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
    maxWidth: '90%',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    gap: 2,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    fontFamily: typography.fonts.body,
    fontSize: typography.size.md,
    color: colors.text,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
