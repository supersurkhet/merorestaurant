import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useI18n, LOCALE_NAMES, type Locale } from '../../lib/i18n';

const LOCALES: Locale[] = ['en', 'ne'];

export function LanguageSwitcher() {
  const colors = useThemeColor();
  const { locale, setLocale } = useI18n();

  return (
    <View style={styles.container}>
      {LOCALES.map((loc) => {
        const isActive = locale === loc;
        const info = LOCALE_NAMES[loc];
        return (
          <Pressable
            key={loc}
            style={[
              styles.option,
              {
                backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setLocale(loc);
            }}
          >
            <Globe size={16} color={isActive ? '#fff' : colors.textSecondary} />
            <Text
              style={[
                styles.optionText,
                { color: isActive ? '#fff' : colors.text },
              ]}
            >
              {info.nativeName}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: { fontSize: 14, fontWeight: '600' },
});
