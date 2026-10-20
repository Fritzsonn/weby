import { Stack } from 'expo-router';
import { colors, typography } from '@/constants/theme';

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.brand,
        headerTitleStyle: {
          fontFamily: typography.fonts.displaySemi,
          color: colors.text,
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Event' }} />
      <Stack.Screen name="attendees" options={{ title: 'Attendees' }} />
      <Stack.Screen name="meetup" options={{ title: 'Meetups' }} />
      <Stack.Screen name="album" options={{ title: 'Memories' }} />
    </Stack>
  );
}
