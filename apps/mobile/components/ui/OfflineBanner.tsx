import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useI18n } from '../../lib/i18n';

export function OfflineBanner() {
  const isConnected = useNetworkStatus();
  const { t } = useI18n();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={16} color="#fff" />
      <Text style={styles.text}>{t.offline.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
