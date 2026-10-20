import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { ErrorState } from '@/components/ui/ErrorState';
import { getSampleProfileById } from '@/data/sample-users';
import { colors, radii, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile: me } = useAuth();
  const {
    friendIds,
    friendRequests,
    sendFriendRequest,
    removeFriend,
    blockUser,
    ensureDirectConversation,
  } = useAppData();

  const profile = me?.id === id ? me : getSampleProfileById(id);
  if (!profile) {
    return (
      <Screen>
        <ErrorState title="Profile not found" />
      </Screen>
    );
  }

  const isMe = me?.id === profile.id;
  const isFriend = friendIds.includes(profile.id);
  const pending = friendRequests.some(
    (r) =>
      r.status === 'pending' &&
      ((r.from_user_id === me?.id && r.to_user_id === profile.id) ||
        (r.to_user_id === me?.id && r.from_user_id === profile.id))
  );

  return (
    <>
      <Stack.Screen options={{ title: profile.display_name }} />
      <Screen scroll>
        <View style={styles.header}>
          <Avatar uri={profile.avatar_url} name={profile.display_name} size="xl" />
          <Text variant="title">{profile.display_name}</Text>
          <Text variant="caption" tone="secondary">
            @{profile.username}
          </Text>
          {profile.show_city && profile.city ? (
            <Text variant="caption" tone="muted">
              {profile.city}
              {profile.show_age && profile.birth_year
                ? ` · ${new Date().getFullYear() - profile.birth_year}`
                : ''}
            </Text>
          ) : null}
          {profile.bio ? (
            <Text variant="body" tone="secondary" style={styles.bio}>
              {profile.bio}
            </Text>
          ) : null}
        </View>

        <Text variant="bodyMedium">Interests</Text>
        <View style={styles.chips}>
          {profile.interests.map((i) => (
            <Chip key={i} label={i} selected />
          ))}
        </View>

        {!isMe ? (
          <View style={styles.actions}>
            {isFriend ? (
              <>
                <Button
                  label="Message"
                  fullWidth
                  onPress={async () => {
                    const cid = await ensureDirectConversation(profile.id);
                    router.push(`/chat/${cid}`);
                  }}
                />
                <Button
                  label="Remove friend"
                  variant="ghost"
                  fullWidth
                  onPress={() => removeFriend(profile.id)}
                />
              </>
            ) : (
              <Button
                label={pending ? 'Request pending' : 'Add friend'}
                fullWidth
                disabled={pending || !profile.allow_friend_requests}
                onPress={() => sendFriendRequest(profile.id)}
              />
            )}
            <Button
              label="Block user"
              variant="danger"
              fullWidth
              onPress={() => {
                Alert.alert(
                  'Block user?',
                  'They won’t be able to message you or see your profile in discovery.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Block',
                      style: 'destructive',
                      onPress: () => blockUser(profile.id),
                    },
                  ]
                );
              }}
            />
            <Button
              label="Report"
              variant="ghost"
              fullWidth
              onPress={() =>
                Alert.alert(
                  'Report submitted',
                  'Reports are reviewed by moderators. Automated systems alone are not sufficient.'
                )
              }
            />
          </View>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  bio: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
});
