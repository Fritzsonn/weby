import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { colors, radii } from '@/constants/theme';

const sizes = { sm: 32, md: 44, lg: 64, xl: 96 } as const;

export function Avatar({
  uri,
  name,
  size = 'md',
}: {
  uri?: string | null;
  name: string;
  size?: keyof typeof sizes;
}) {
  const dim = sizes[size];
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: dim, height: dim, borderRadius: dim / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: dim, height: dim, borderRadius: dim / 2 },
      ]}
    >
      <Text
        variant={size === 'xl' || size === 'lg' ? 'subtitle' : 'caption'}
        tone="brand"
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
});
