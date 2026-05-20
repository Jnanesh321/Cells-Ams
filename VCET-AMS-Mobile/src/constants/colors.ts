export interface ThemeColors {
  // Backgrounds
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgInput: string;
  bgModal: string;
  bgGradientStart: string;
  bgGradientEnd: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textMuted: string;

  // Borders
  border: string;
  borderLight: string;

  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Status bar
  statusBar: 'light-content' | 'dark-content';
  statusBarBg: string;

  // Accents by role
  accentStudent: string;
  accentFaculty: string;
  accentHod: string;
  accentPrincipal: string;
  accentAdmin: string;
  accentParent: string;
  accentAdmission: string;

  // Functional colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Gradient cards
  cardStudent: [string, string];
  cardFaculty: [string, string];
  cardHod: [string, string];
  cardPrincipal: [string, string];
  cardAdmin: [string, string];

  // Misc
  skeleton: string;
  overlay: string;
  refreshControl: string;
  placeholder: string;
}

export const lightColors: ThemeColors = {
  bg: '#FFFFFF',
  bgSecondary: '#F8FAFC',
  bgTertiary: '#F1F5F9',
  bgCard: '#FFFFFF',
  bgInput: '#F1F5F9',
  bgModal: '#FFFFFF',
  bgGradientStart: '#F8FAFC',
  bgGradientEnd: '#E2E8F0',

  text: '#0F172A',
  textSecondary: '#334155',
  textTertiary: '#475569',
  textInverse: '#FFFFFF',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#94A3B8',

  statusBar: 'dark-content',
  statusBarBg: '#FFFFFF',

  accentStudent: '#3B82F6',
  accentFaculty: '#6366F1',
  accentHod: '#6366F1',
  accentPrincipal: '#F59E0B',
  accentAdmin: '#EF4444',
  accentParent: '#F59E0B',
  accentAdmission: '#6366F1',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  cardStudent: ['#3B82F6', '#1D4ED8'] as [string, string],
  cardFaculty: ['#6366F1', '#4338CA'] as [string, string],
  cardHod: ['#8B5CF6', '#6D28D9'] as [string, string],
  cardPrincipal: ['#F59E0B', '#D97706'] as [string, string],
  cardAdmin: ['#EF4444', '#DC2626'] as [string, string],

  skeleton: '#E2E8F0',
  overlay: 'rgba(0,0,0,0.5)',
  refreshControl: '#3B82F6',
  placeholder: '#94A3B8',
};

export const darkColors: ThemeColors = {
  bg: '#0F172A',
  bgSecondary: '#1E293B',
  bgTertiary: '#334155',
  bgCard: '#1E293B',
  bgInput: '#334155',
  bgModal: '#1E293B',
  bgGradientStart: '#0F172A',
  bgGradientEnd: '#1E293B',

  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  textMuted: '#64748B',

  border: '#334155',
  borderLight: '#1E293B',

  tabBar: '#0F172A',
  tabBarBorder: '#1E293B',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#64748B',

  statusBar: 'light-content',
  statusBarBg: '#0F172A',

  accentStudent: '#3B82F6',
  accentFaculty: '#6366F1',
  accentHod: '#6366F1',
  accentPrincipal: '#F59E0B',
  accentAdmin: '#EF4444',
  accentParent: '#F59E0B',
  accentAdmission: '#6366F1',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  cardStudent: ['#2563EB', '#1D4ED8'] as [string, string],
  cardFaculty: ['#4F46E5', '#3730A3'] as [string, string],
  cardHod: ['#7C3AED', '#5B21B6'] as [string, string],
  cardPrincipal: ['#F59E0B', '#B45309'] as [string, string],
  cardAdmin: ['#DC2626', '#B91C1C'] as [string, string],

  skeleton: '#1E293B',
  overlay: 'rgba(0,0,0,0.7)',
  refreshControl: '#3B82F6',
  placeholder: '#64748B',
};

export type ColorScheme = 'light' | 'dark';
