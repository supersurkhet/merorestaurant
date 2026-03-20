import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X,
  Minus,
  Plus,
  Trash2,
  MessageSquare,
  User,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMutation } from 'convex/react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useCartStore, type CartItem } from '../../store/cart';
import { api } from '../../lib/convex-api';
import type { Id } from '../../lib/convex-types';

const VAT_RATE = 0.13;

function CartItemRow({ item, index }: { item: CartItem; index: number }) {
  const colors = useThemeColor();
  const { updateQuantity, removeItem, updateInstructions } = useCartStore();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(300)}
      style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.itemTop}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          {item.nameNe ? (
            <Text style={[styles.itemNameNe, { color: colors.textSecondary }]}>{item.nameNe}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeItem(item.menuItemId);
          }}
          hitSlop={12}
          style={[styles.deleteBtn, { backgroundColor: `${colors.error}12` }]}
        >
          <Trash2 size={16} color={colors.error} />
        </Pressable>
      </View>

      {/* Price + quantity */}
      <View style={styles.priceRow}>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          Rs. {(item.price * item.quantity).toLocaleString()}
        </Text>

        <View style={[styles.qtyControl, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateQuantity(item.menuItemId, item.quantity - 1);
            }}
            style={styles.qtyBtn}
          >
            <Minus size={14} color={item.quantity <= 1 ? colors.textSecondary : colors.text} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateQuantity(item.menuItemId, item.quantity + 1);
            }}
            style={styles.qtyBtn}
          >
            <Plus size={14} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Unit price hint */}
      {item.quantity > 1 ? (
        <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
          Rs. {item.price.toLocaleString()} x {item.quantity}
        </Text>
      ) : null}

      {/* Special instructions */}
      <Pressable
        style={[styles.instrBox, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
      >
        <MessageSquare size={13} color={colors.textSecondary} />
        <TextInput
          style={[styles.instrInput, { color: colors.text }]}
          placeholder="Add special instructions..."
          placeholderTextColor={colors.textSecondary}
          value={item.specialInstructions}
          onChangeText={(text) => updateInstructions(item.menuItemId, text)}
          multiline
          numberOfLines={1}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function CartScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const clearCart = useCartStore((s) => s.clearCart);
  const tableId = useCartStore((s) => s.tableId);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const placeOrder = useMutation(api.orders.placeOrder);
  const [customerName, setCustomerName] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = total;
  const vat = Math.round(subtotal * VAT_RATE);
  const grandTotal = subtotal + vat;

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !restaurantId) return;
    setIsPlacing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const result = await placeOrder({
        restaurantId: restaurantId as Id<'restaurants'>,
        tableId: tableId ? (tableId as Id<'tables'>) : undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItemId as Id<'menuItems'>,
          quantity: i.quantity,
          notes: i.specialInstructions || undefined,
        })),
        customerName: customerName || undefined,
      });

      clearCart();
      setIsPlacing(false);
      router.dismiss();
      router.push(`/order/${result.orderNumber}`);
    } catch (err) {
      setIsPlacing(false);
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      Alert.alert('Order Failed', msg);
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Cart</Text>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyWrap}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContent}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}10` }]}>
              <ShoppingBag size={40} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Browse the menu and add some delicious Nepali dishes
            </Text>
            <Pressable
              style={[styles.browseBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.dismiss()}
            >
              <Text style={styles.browseBtnText}>Browse Menu</Text>
              <ChevronRight size={18} color="#fff" />
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your Order</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
              {tableId ? ` · Table connected` : ''}
            </Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cart items */}
          {items.map((item, index) => (
            <CartItemRow key={item.menuItemId} item={item} index={index} />
          ))}

          {/* Customer name */}
          <Animated.View
            entering={FadeInDown.delay(items.length * 60).duration(300)}
            style={[styles.nameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.nameRow}>
              <User size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.nameInput, { color: colors.text }]}
                placeholder="Your name (optional)"
                placeholderTextColor={colors.textSecondary}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>
          </Animated.View>

          {/* Bill summary */}
          <Animated.View
            entering={FadeInDown.delay((items.length + 1) * 60).duration(300)}
            style={[styles.billCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.billTitle, { color: colors.text }]}>Bill Summary</Text>

            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.billValue, { color: colors.text }]}>
                Rs. {subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>VAT (13%)</Text>
              <Text style={[styles.billValue, { color: colors.text }]}>
                Rs. {vat.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.billDivider, { backgroundColor: colors.border }]} />
            <View style={styles.billRow}>
              <Text style={[styles.billGrandLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.billGrandValue, { color: colors.primary }]}>
                Rs. {grandTotal.toLocaleString()}
              </Text>
            </View>
          </Animated.View>

          {/* Clear cart link */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              clearCart();
            }}
            style={styles.clearBtn}
          >
            <Trash2 size={14} color={colors.error} />
            <Text style={[styles.clearBtnText, { color: colors.error }]}>Clear Cart</Text>
          </Pressable>
        </ScrollView>

        {/* Sticky checkout footer */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.footerLeft}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.footerTotal, { color: colors.text }]}>
              Rs. {grandTotal.toLocaleString()}
            </Text>
          </View>
          <Pressable
            style={[styles.placeBtn, { backgroundColor: colors.primary, opacity: isPlacing ? 0.7 : 1 }]}
            onPress={handlePlaceOrder}
            disabled={isPlacing}
          >
            <Text style={styles.placeBtnText}>
              {isPlacing ? 'Placing...' : 'Place Order'}
            </Text>
            {!isPlacing && <ChevronRight size={18} color="#fff" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 140 },

  // Item card
  itemCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  itemNameNe: { fontSize: 13, marginTop: 2 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemPrice: { fontSize: 18, fontWeight: '800' },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyText: { fontSize: 16, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  unitHint: { fontSize: 12 },
  instrBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  instrInput: { flex: 1, fontSize: 13, padding: 0 },

  // Customer name
  nameCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameInput: { flex: 1, fontSize: 15, padding: 0 },

  // Bill
  billCard: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 10 },
  billTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { fontSize: 14 },
  billValue: { fontSize: 14, fontWeight: '600' },
  billDivider: { height: 1, marginVertical: 4 },
  billGrandLabel: { fontSize: 17, fontWeight: '800' },
  billGrandValue: { fontSize: 20, fontWeight: '900' },

  // Clear cart
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  clearBtnText: { fontSize: 14, fontWeight: '600' },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
  },
  footerLeft: {},
  footerLabel: { fontSize: 12, fontWeight: '500' },
  footerTotal: { fontSize: 22, fontWeight: '900' },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 16,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Empty state
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyContent: { alignItems: 'center', gap: 16 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 4,
  },
  browseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
