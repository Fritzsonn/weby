import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

type Variant =
  | 'display'
  | 'hero'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyMedium'
  | 'caption'
  | 'label';

type Tone = 'default' | 'secondary' | 'muted' | 'inverse' | 'brand' | 'accent' | 'danger';

export interface AppTextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
}

const toneColor: Record<Tone, string> = {
  default: colors.text,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  inverse: colors.textInverse,
  brand: colors.brand,
  accent: colors.accent,
  danger: colors.danger,
};

export function Text({
  variant = 'body',
  tone = 'default',
  style,
  ...props
}: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[styles.base, styles[variant], { color: toneColor[tone] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  display: {
    fontFamily: typography.fonts.display,
    fontSize: typography.size.display,
    lineHeight: typography.size.display * typography.lineHeight.tight,
  },
  hero: {
    fontFamily: typography.fonts.display,
    fontSize: typography.size.hero,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
  },
  title: {
    fontFamily: typography.fonts.displaySemi,
    fontSize: typography.size.xxl,
    lineHeight: typography.size.xxl * typography.lineHeight.snug,
  },
  subtitle: {
    fontFamily: typography.fonts.displayMedium,
    fontSize: typography.size.xl,
    lineHeight: typography.size.xl * typography.lineHeight.snug,
  },
  body: {
    fontFamily: typography.fonts.body,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  bodyMedium: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  caption: {
    fontFamily: typography.fonts.body,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  label: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.size.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
