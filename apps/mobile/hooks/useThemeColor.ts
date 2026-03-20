import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '../constants/colors';

export function useThemeColor(): ThemeColors & { colorScheme: 'light' | 'dark' } {
  const scheme = useColorScheme();
  const colorScheme = scheme === 'dark' ? 'dark' : 'light';
  return { ...Colors[colorScheme], colorScheme };
}
