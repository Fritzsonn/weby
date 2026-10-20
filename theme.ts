/**
 * Weby design system
 * Direction: coastal dusk — deep teal trust + soft sand surfaces + coral energy.
 * Avoids purple gradients, cream/terracotta serif, and broadsheet layouts.
 */

export const colors = {
  // Brand
  brand: '#0F6B6B',
  brandDark: '#0A4F4F',
  brandLight: '#1A8F8F',
  brandMuted: '#D4EDED',
  accent: '#E86F4A',
  accentSoft: '#FFF0EB',
  highlight: '#F4B942',

  // Surfaces
  background: '#F7F5F2',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#EEEAE4',
  surfaceTint: '#E8F4F3',

  // Text
  text: '#1A2424',
  textSecondary: '#5A6666',
  textMuted: '#8A9595',
  textInverse: '#FFFFFF',
  textOnBrand: '#FFFFFF',

  // Borders & states
  border: '#E2DDD6',
  borderStrong: '#C9C3BA',
  success: '#2F9E6F',
  successSoft: '#E6F6EE',
  warning: '#D4920A',
  warningSoft: '#FFF6E0',
  danger: '#D14545',
  dangerSoft: '#FDECEC',
  info: '#2B7A9E',
  infoSoft: '#E8F3F8',

  // Overlays
  overlay: 'rgba(15, 30, 30, 0.48)',
  shadow: 'rgba(15, 40, 40, 0.12)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  section: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const typography = {
  fonts: {
    display: 'PlusJakartaSans_700Bold',
    displaySemi: 'PlusJakartaSans_600SemiBold',
    displayMedium: 'PlusJakartaSans_500Medium',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyBold: 'DMSans_700Bold',
  },
  size: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.45,
    relaxed: 1.6,
  },
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const touchTarget = 44;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  touchTarget,
} as const;

export type Theme = typeof theme;
