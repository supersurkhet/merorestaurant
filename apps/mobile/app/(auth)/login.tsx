import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useI18n } from '../../lib/i18n';
import { loginWithWorkOS } from '../../lib/auth';

export default function LoginScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[Auth] Login button pressed');

    try {
      const success = await loginWithWorkOS();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('[Auth] Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={24} color={colors.text} />
      </Pressable>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <Text style={{ fontSize: 56 }}>{'🍽️'}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{t.auth.welcomeBack}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.auth.signIn}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.form}>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <LogIn size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>{t.auth.signInBtn}</Text>
              </>
            )}
          </Pressable>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Sign in with your email, Google, or social account via WorkOS AuthKit
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: 12, marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  form: { gap: 16 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 13, lineHeight: 18 },
});
