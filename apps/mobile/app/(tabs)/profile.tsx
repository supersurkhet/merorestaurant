import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, Globe, Moon, ChevronRight, Info, QrCode } from 'lucide-react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useSessionStore } from '../../store/session';
import { useI18n } from '../../lib/i18n';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

export default function ProfileScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { t } = useI18n();
  const session = useSessionStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t.profile.title}</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <User size={32} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{t.profile.guest}</Text>
        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>
            {t.profile.signInPrompt}
          </Text>
        </Pressable>
      </View>

      {/* Current session info */}
      {session.isActive && (
        <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sessionRow}>
            <QrCode size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>Current Restaurant</Text>
              <Text style={[styles.sessionValue, { color: colors.text }]}>{session.restaurantName}</Text>
              {session.tableLabel && (
                <Text style={[styles.sessionTable, { color: colors.textSecondary }]}>{session.tableLabel}</Text>
              )}
            </View>
            <Pressable
              onPress={() => { session.endSession(); }}
              style={[styles.endBtn, { borderColor: colors.error }]}
            >
              <Text style={[styles.endBtnText, { color: colors.error }]}>End</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Settings */}
      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.menuItem, { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
          <Globe size={20} color={colors.icon} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t.profile.language}</Text>
          <LanguageSwitcher />
        </View>
        <View style={styles.menuItem}>
          <Moon size={20} color={colors.icon} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{t.profile.darkMode}</Text>
          <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{t.profile.system}</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>
      </View>

      {/* About */}
      <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Info size={20} color={colors.icon} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>About MeroRestaurant</Text>
          <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
            Multi-restaurant ordering platform for Nepal. Scan, order, pay — at any partner restaurant.
          </Text>
        </View>
      </View>

      {/* Sign out */}
      <Pressable style={[styles.signOutBtn, { borderColor: colors.border }]}>
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>{t.profile.signOut}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700' },
  loginLink: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  sessionCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionLabel: { fontSize: 12, fontWeight: '500' },
  sessionValue: { fontSize: 16, fontWeight: '700' },
  sessionTable: { fontSize: 13, marginTop: 2 },
  endBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  endBtnText: { fontSize: 13, fontWeight: '700' },
  menuSection: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  menuValue: { fontSize: 14, marginRight: 4 },
  aboutCard: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginBottom: 16, alignItems: 'flex-start' },
  aboutTitle: { fontSize: 16, fontWeight: '700' },
  aboutDesc: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 8, padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  signOutText: { fontSize: 16, fontWeight: '600' },
});
