import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { useCartStore } from '../../store/cart';
import { useThemeColor } from '../../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

export function CartFloatingButton() {
  const colors = useThemeColor();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount());
  const total = useCartStore((s) => s.total());

  if (itemCount === 0) return null;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.primary }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/cart');
      }}
    >
      <View style={styles.left}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
        <ShoppingBag size={20} color="#fff" />
        <Text style={styles.label}>View Cart</Text>
      </View>
      <Text style={styles.total}>Rs. {total.toLocaleString()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  label: { color: '#fff', fontSize: 16, fontWeight: '700' },
  total: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
