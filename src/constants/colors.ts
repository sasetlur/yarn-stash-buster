import { ColorFamily } from '../types/yarn';

export const THEME = {
  primary: '#6B4C9A',
  primaryLight: '#8B6FBF',
  primaryDark: '#4A3470',
  background: '#FAF8FC',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
};

export const COLOR_SWATCH_MAP: Record<ColorFamily, string> = {
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#EAB308',
  green: '#16A34A',
  blue: '#2563EB',
  purple: '#7C3AED',
  pink: '#EC4899',
  white: '#F9FAFB',
  black: '#1F2937',
  gray: '#9CA3AF',
  brown: '#92400E',
  multicolor: '#gradient',
};

export const RAVELRY_WEIGHT_MAP: Record<string, string> = {
  'lace': 'lace',
  'fingering': 'fingering',
  'sport': 'sport',
  'DK': 'dk',
  'worsted': 'worsted',
  'aran': 'aran',
  'bulky': 'bulky',
  'super-bulky': 'super-bulky',
};
