import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { addDays, isAfter, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, radii, spacing } from '@/constants/theme';
import { formatRelative } from '@/lib/format';
import { useAppData } from '@/providers/AppDataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { EventPhoto } from '@/types';
import { DEMO_USER_ID } from '@/data/sample-users';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { events, goingIds, photos, likePhoto, addLocalPhoto } = useAppData();
  const [uploading, setUploading] = useState(false);

  const event = events.find((e) => e.id === id);
  const albumPhotos = photos.filter((p) => p.event_id === id);
  const eligible = goingIds.includes(id);

  const uploadsOpen = useMemo(() => {
    if (!event) return false;
    const closes = addDays(parseISO(event.ends_at ?? event.starts_at), 7);
    return isAfter(closes, new Date());
  }, [event]);

  async function pickAndUpload() {
    if (!eligible) {
      Alert.alert('Attendees only', 'Mark I’m Going to upload to this album.');
      return;
    }
    if (!uploadsOpen) {
      Alert.alert('Album read-only', 'Uploads closed 7 days after the event.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to share memories.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const photo: EventPhoto = {
        id: `photo-${Date.now()}`,
        album_id: `album-${id}`,
        event_id: id,
        uploader_id: profile?.id ?? DEMO_USER_ID,
        storage_path: asset.uri,
        caption: null,
        moderation_status: 'pending',
        like_count: 0,
        created_at: new Date().toISOString(),
        uploader: profile ?? undefined,
        liked_by_me: false,
        signed_url: asset.uri,
      };
      await addLocalPhoto(photo);
      Alert.alert(
        'Photo added',
        'In production, uploads go to private Supabase Storage and enter moderation before wider visibility.'
      );
    } finally {
      setUploading(false);
    }
  }

  function reportPhoto(photoId: string) {
    Alert.alert(
      'Report photo',
      'Thanks — this report will be queued for human moderation. Automated filters alone are not enough.',
      [{ text: 'OK' }]
    );
    // Report payload would be sent to reports table via RLS-backed insert.
    void photoId;
  }

  if (!event) {
    return (
      <Screen>
        <EmptyState title="Album unavailable" message="Event not found." />
      </Screen>
    );
  }

  if (uploading) {
    return <LoadingState message="Adding photo…" />;
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text variant="body" tone="secondary">
          {uploadsOpen
            ? 'Uploads open for attendees. Photos are private by default until signed URLs are issued.'
            : 'This album is read-only. Uploads closed 7 days after the event.'}
        </Text>
        <Button
          label="Upload photo"
          onPress={pickAndUpload}
          disabled={!eligible || !uploadsOpen}
        />
      </View>

      <FlatList
        data={albumPhotos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title="No memories yet"
            message="Be the first to share a photo from this event."
            actionLabel={eligible && uploadsOpen ? 'Upload photo' : undefined}
            onAction={eligible && uploadsOpen ? pickAndUpload : undefined}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.signed_url ?? item.storage_path }}
              style={styles.image}
              contentFit="cover"
            />
            <View style={styles.meta}>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {item.uploader?.display_name ?? 'Attendee'} · {formatRelative(item.created_at)}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => likePhoto(item.id)}
                  style={styles.action}
                >
                  <Ionicons
                    name={item.liked_by_me ? 'heart' : 'heart-outline'}
                    size={18}
                    color={item.liked_by_me ? colors.accent : colors.textSecondary}
                  />
                  <Text variant="caption">{item.like_count}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => reportPhoto(item.id)}
                  style={styles.action}
                >
                  <Ionicons name="flag-outline" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
              {item.moderation_status === 'pending' ? (
                <Text variant="caption" tone="muted">
                  Pending moderation
                </Text>
              ) : null}
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.section,
  },
  row: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 140,
  },
  meta: {
    padding: spacing.sm,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
  },
});
