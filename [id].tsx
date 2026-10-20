import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { formatRelative } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { DEMO_USER_ID } from '@/data/sample-users';

export default function DirectChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const {
    conversations,
    messagesByConversation,
    sendMessage,
    markConversationRead,
  } = useAppData();
  const [draft, setDraft] = useState('');
  const me = profile?.id ?? DEMO_USER_ID;
  const conversation = conversations.find((c) => c.id === id);
  const messages = messagesByConversation[id] ?? [];
  const other = conversation?.members?.find((m) => m.user_id !== me)?.profile;

  useEffect(() => {
    void markConversationRead(id);
  }, [id, markConversationRead]);

  return (
    <>
      <Stack.Screen options={{ title: other?.display_name ?? 'Chat' }} />
      <Screen padded={false} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={88}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const mine = item.sender_id === me;
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text variant="body" tone={mine ? 'inverse' : 'default'}>
                    {item.body}
                  </Text>
                  <Text
                    variant="caption"
                    tone={mine ? 'inverse' : 'muted'}
                    style={styles.time}
                  >
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
              placeholder="Message…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send"
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
  list: {
    padding: spacing.xl,
    gap: spacing.sm,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  time: {
    marginTop: 4,
    opacity: 0.8,
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
