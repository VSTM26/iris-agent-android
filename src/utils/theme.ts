/**
 * Theme and color system for Iris Agent mobile apps
 */

export const Colors = {
  // Primary Colors
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#8b9eff',

  // Backgrounds
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceAlt: '#f9f9f9',

  // Text Colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#ffffff',

  // Borders & Dividers
  border: '#e8e8e8',
  borderLight: '#f0f0f0',
  divider: '#f0f0f0',

  // Status Colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#d32f2f',
  info: '#2196f3',

  // Semantic Colors
  online: '#4caf50',
  offline: '#999999',
  pending: '#ff9800',
  sent: '#2196f3',

  // Message Bubbles
  userBubble: '#667eea',
  userText: '#ffffff',
  assistantBubble: '#f0f0f0',
  assistantText: '#333333',

  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  full: 50,
};

export const Typography = {
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  hint: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Gradients = {
  primary: [Colors.gradientStart, Colors.gradientEnd],
  light: ['#f8f9fa', '#ffffff'],
  success: ['#4caf50', '#45a049'],
  error: ['#d32f2f', '#c62828'],
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  gradients: Gradients,
};

export default Theme;
