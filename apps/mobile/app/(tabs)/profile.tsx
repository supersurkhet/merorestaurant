import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, Globe, Moon, ChevronRight } from 'lucide-react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ProfileScreen() {
  const colors = useThemeColor();
  const router = useRouter();

  const menuItems = [
    { icon: Globe, label: 'Language', value: 'English', onPress: () => {} },
    { icon: Moon, label: 'Dark Mode', value: 'System', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      {/* Avatar placeholder */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <User size={32} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>Guest</Text>
        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>
            Sign in for a better experience
          </Text>
        </Pressable>
      </View>

      {/* Menu items */}
      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {menuItems.map((item, i) => (
          <Pressable
            key={item.label}
            style={[
              styles.menuItem,
              i < menuItems.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
            ]}
            onPress={item.onPress}
          >
            <item.icon size={20} color={colors.icon} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{item.value}</Text>
            <ChevronRight size={16} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      {/* Sign out */}
      <Pressable style={[styles.signOutBtn, { borderColor: colors.border }]}>
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '700' },
  loginLink: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  menuSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  menuValue: { fontSize: 14, marginRight: 4 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  signOutText: { fontSize: 16, fontWeight: '600' },
});
