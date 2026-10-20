import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/constants/theme';

export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle,
  refreshing,
  onRefresh,
  edges = ['top'],
  gradient = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  gradient?: boolean;
}) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padded && styles.pad,
        styles.scrollContent,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[padded && styles.pad, styles.fill, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safe, style]}>
      {gradient ? (
        <LinearGradient
          colors={['#E8F4F3', colors.background, '#F7F5F2']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  pad: {
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.section,
    flexGrow: 1,
  },
});
