export const Colors = {
  light: {
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    card: '#ffffff',
    border: '#e5e7eb',
    primary: '#e63946',
    primaryLight: '#fee2e2',
    accent: '#f4a261',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#e63946',
    icon: '#6b7280',
  },
  dark: {
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    background: '#0f0f1a',
    backgroundSecondary: '#1a1a2e',
    card: '#1a1a2e',
    border: '#2d2d44',
    primary: '#e63946',
    primaryLight: '#3b1a1e',
    accent: '#f4a261',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#e63946',
    icon: '#9ca3af',
  },
} as const;

export type ThemeColors = {
  [K in keyof typeof Colors.light]: string;
};
