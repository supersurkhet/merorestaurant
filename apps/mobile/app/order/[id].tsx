import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Bell,
  Utensils,
  CreditCard,
  Timer,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';

type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served';

const ORDER_STEPS: {
  key: OrderStatus;
  label: string;
  labelNe: string;
  icon: typeof CheckCircle2;
  description: string;
  estimateMin: number;
}[] = [
  {
    key: 'placed',
    label: 'Order Placed',
    labelNe: 'अर्डर राखियो',
    icon: CheckCircle2,
    description: 'Your order has been received',
    estimateMin: 0,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    labelNe: 'पुष्टि भयो',
    icon: CheckCircle2,
    description: 'Kitchen has confirmed your order',
    estimateMin: 2,
  },
  {
    key: 'preparing',
    label: 'Preparing',
    labelNe: 'तयारी हुँदैछ',
    icon: ChefHat,
    description: 'Your food is being freshly prepared',
    estimateMin: 15,
  },
  {
    key: 'ready',
    label: 'Ready to Serve',
    labelNe: 'सर्भ गर्न तयार',
    icon: Bell,
    description: 'Your food is ready! The waiter will bring it shortly.',
    estimateMin: 20,
  },
  {
    key: 'served',
    label: 'Served',
    labelNe: 'सर्भ भयो',
    icon: Utensils,
    description: 'Enjoy your meal! भोजनको मजा लिनुहोस्!',
    estimateMin: 25,
  },
];

const STATUS_COLORS: Record<OrderStatus, { dot: string; glow: string }> = {
  placed: { dot: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  confirmed: { dot: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
  preparing: { dot: '#e63946', glow: 'rgba(230,57,70,0.15)' },
  ready: { dot: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  served: { dot: '#6b7280', glow: 'rgba(107,114,128,0.1)' },
};

// Demo order — will come from Convex subscription: useQuery(api.orders.get, { id })
const DEMO_ORDER = {
  status: 'preparing' as OrderStatus,
  orderNumber: 'ORD-1001',
  items: [
    { name: 'Chicken Momo (Steam)', nameNe: 'चिकन मोमो (स्टीम)', quantity: 2, price: 250 },
    { name: 'Dal Bhat Tarkari Set', nameNe: 'दालभात तरकारी सेट', quantity: 1, price: 350 },
    { name: 'Masala Tea', nameNe: 'मसला चिया', quantity: 2, price: 80 },
  ],
  table: 'Table 5',
  customerName: 'Guest',
  placedAt: Date.now() - 8 * 60 * 1000, // 8 min ago
};

const VAT_RATE = 0.13;

export default function OrderDetailScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Convex re-subscription will handle this automatically
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const order = DEMO_ORDER;
  const currentIdx = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const currentStep = ORDER_STEPS[currentIdx];
  const statusColor = STATUS_COLORS[order.status];

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  // Estimated remaining time
  const minutesSincePlaced = Math.round((Date.now() - order.placedAt) / 60000);
  const estTotal = currentStep.estimateMin + 5; // add buffer
  const estRemaining = Math.max(0, estTotal - minutesSincePlaced);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {order.orderNumber || `Order #${id}`}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {order.table}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status hero banner */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.statusHero, { backgroundColor: statusColor.glow }]}
        >
          <View style={[styles.statusIconWrap, { backgroundColor: statusColor.dot }]}>
            <currentStep.icon size={28} color="#fff" />
          </View>
          <Text style={[styles.statusLabel, { color: statusColor.dot }]}>
            {currentStep.label}
          </Text>
          <Text style={[styles.statusLabelNe, { color: statusColor.dot }]}>
            {currentStep.labelNe}
          </Text>
          <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
            {currentStep.description}
          </Text>

          {/* ETA */}
          {order.status !== 'served' && (
            <Animated.View
              entering={FadeIn.delay(200).duration(300)}
              style={[styles.etaBadge, { backgroundColor: `${statusColor.dot}18` }]}
            >
              <Timer size={14} color={statusColor.dot} />
              <Text style={[styles.etaText, { color: statusColor.dot }]}>
                {estRemaining > 0
                  ? `~${estRemaining} min remaining`
                  : 'Any moment now!'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Timeline */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Progress</Text>
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index < currentIdx;
            const isCurrent = index === currentIdx;
            const isUpcoming = index > currentIdx;
            const stepColor = isCompleted
              ? '#10b981'
              : isCurrent
                ? statusColor.dot
                : colors.border;

            return (
              <Animated.View
                key={step.key}
                entering={FadeInLeft.delay(150 + index * 80).duration(300)}
                style={styles.timelineStep}
              >
                <View style={styles.timelineLeft}>
                  {/* Dot */}
                  <Animated.View
                    entering={FadeIn.delay(200 + index * 80)}
                    style={[styles.dot, { backgroundColor: stepColor }]}
                  >
                    <step.icon
                      size={13}
                      color={isUpcoming ? colors.textSecondary : '#fff'}
                    />
                  </Animated.View>
                  {/* Line */}
                  {index < ORDER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        { backgroundColor: isCompleted ? '#10b981' : colors.border },
                      ]}
                    />
                  )}
                </View>
                <View style={[styles.timelineRight, index < ORDER_STEPS.length - 1 && { paddingBottom: 18 }]}>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: isUpcoming ? colors.textSecondary : colors.text },
                      !isUpcoming && { fontWeight: '700' },
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Animated.Text
                      entering={SlideInRight.delay(300 + index * 80).duration(250)}
                      style={[styles.stepCurrent, { color: statusColor.dot }]}
                    >
                      {step.description}
                    </Animated.Text>
                  )}
                  {isCompleted && (
                    <Text style={[styles.stepDone, { color: '#10b981' }]}>Completed</Text>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Order items */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.itemsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
          {order.items.map((item, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(250 + i * 50).duration(250)}
              style={[
                styles.orderItem,
                i < order.items.length - 1 && {
                  borderBottomColor: colors.border,
                  borderBottomWidth: 0.5,
                },
              ]}
            >
              <View style={styles.orderItemLeft}>
                <View style={[styles.qtyBadge, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}x</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderItemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.orderItemNameNe, { color: colors.textSecondary }]}>
                    {item.nameNe}
                  </Text>
                </View>
              </View>
              <Text style={[styles.orderItemPrice, { color: colors.textSecondary }]}>
                Rs. {(item.price * item.quantity).toLocaleString()}
              </Text>
            </Animated.View>
          ))}

          {/* Totals */}
          <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                Rs. {subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>VAT (13%)</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                Rs. {vat.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.grandLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.grandValue, { color: colors.primary }]}>
                Rs. {total.toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Pay button */}
        {order.status !== 'served' && (
          <Animated.View entering={FadeInDown.delay(400).duration(300)}>
            <Pressable
              style={[styles.payBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/payment?orderId=${id}&amount=${total}`)}
            >
              <CreditCard size={20} color="#fff" />
              <Text style={styles.payBtnText}>Pay Rs. {total.toLocaleString()}</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },

  // Status hero
  statusHero: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  statusIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusLabel: { fontSize: 22, fontWeight: '800' },
  statusLabelNe: { fontSize: 16, fontWeight: '600', marginTop: -4 },
  statusDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 8,
  },
  etaText: { fontSize: 13, fontWeight: '700' },

  // Timeline
  timelineCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  timelineStep: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 26 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, minHeight: 18 },
  timelineRight: { flex: 1, paddingTop: 3 },
  stepLabel: { fontSize: 15 },
  stepCurrent: { fontSize: 13, marginTop: 3, fontWeight: '600' },
  stepDone: { fontSize: 12, marginTop: 2, fontWeight: '600' },

  // Items
  itemsCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  qtyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 13, fontWeight: '700' },
  orderItemName: { fontSize: 15, fontWeight: '600' },
  orderItemNameNe: { fontSize: 12, marginTop: 1 },
  orderItemPrice: { fontSize: 14, fontWeight: '600' },

  // Totals
  totalSection: { borderTopWidth: 1, paddingTop: 12, marginTop: 4, gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 14, fontWeight: '600' },
  totalDivider: { height: 1, marginVertical: 2 },
  grandLabel: { fontSize: 17, fontWeight: '800' },
  grandValue: { fontSize: 20, fontWeight: '900' },

  // Pay
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
