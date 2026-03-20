import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useCartStore } from '../../store/cart';
import * as Haptics from 'expo-haptics';

interface MenuItemCardProps {
  id: string;
  name: string;
  nameNe?: string;
  description?: string;
  price: number;
  image?: string;
  isVeg?: boolean;
  isSpicy?: boolean;
}

export function MenuItemCard({
  id,
  name,
  nameNe,
  description,
  price,
  image,
  isVeg,
  isSpicy,
}: MenuItemCardProps) {
  const colors = useThemeColor();
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem({ menuItemId: id, name, nameNe, price, image });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.info}>
        {/* Badges */}
        <View style={styles.badges}>
          {isVeg && (
            <View style={[styles.badge, { backgroundColor: '#ecfdf5' }]}>
              <Text style={[styles.badgeText, { color: '#10b981' }]}>Veg</Text>
            </View>
          )}
          {isSpicy && (
            <View style={[styles.badge, { backgroundColor: '#fef2f2' }]}>
              <Text style={[styles.badgeText, { color: '#ef4444' }]}>Spicy</Text>
            </View>
          )}
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        {nameNe && (
          <Text style={[styles.nameNe, { color: colors.textSecondary }]}>{nameNe}</Text>
        )}
        {description && (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
        <Text style={[styles.price, { color: colors.primary }]}>
          Rs. {price.toLocaleString()}
        </Text>
      </View>

      <View style={styles.imageSection}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={{ fontSize: 32 }}>🍽️</Text>
          </View>
        )}
        <Pressable
          onPress={handleAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={18} color="#fff" strokeWidth={3} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  info: { flex: 1, justifyContent: 'center' },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  nameNe: { fontSize: 13, marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  price: { fontSize: 16, fontWeight: '800' },
  imageSection: { alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 14 },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
