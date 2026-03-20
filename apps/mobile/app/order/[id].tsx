import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
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
import { useQuery } from 'convex/react';
import { useThemeColor } from '../../hooks/useThemeColor';
import { api } from '../../lib/convex-api';
import type { Order, OrderItem as ConvexOrderItem } from '../../lib/convex-types';

type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served';

const ORDER_STEPS: {
  key: OrderStatus;
  label: string;
  labelNe: string;
  icon: typeof CheckCircle2;
  description: string;
  estimateMin: number;
}[] = [
  { key: 'placed', label: 'Order Placed', labelNe: '\u0905\u0930\u094D\u0921\u0930 \u0930\u093E\u0916\u093F\u092F\u094B', icon: CheckCircle2, description: 'Your order has been received', estimateMin: 0 },
  { key: 'confirmed', label: 'Confirmed', labelNe: '\u092A\u0941\u0937\u094D\u091F\u093F \u092D\u092F\u094B', icon: CheckCircle2, description: 'Kitchen has confirmed your order', estimateMin: 2 },
  { key: 'preparing', label: 'Preparing', labelNe: '\u0924\u092F\u093E\u0930\u0940 \u0939\u0941\u0901\u0926\u0948\u091B', icon: ChefHat, description: 'Your food is being freshly prepared', estimateMin: 15 },
  { key: 'ready', label: 'Ready to Serve', labelNe: '\u0938\u0930\u094D\u092D \u0917\u0930\u094D\u0928 \u0924\u092F\u093E\u0930', icon: Bell, description: 'Your food is ready!', estimateMin: 20 },
  { key: 'served', label: 'Served', labelNe: '\u0938\u0930\u094D\u092D \u092D\u092F\u094B', icon: Utensils, description: 'Enjoy your meal!', estimateMin: 25 },
];

const STATUS_COLORS: Record<OrderStatus, { dot: string; glow: string }> = {
  placed: { dot: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  confirmed: { dot: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
  preparing: { dot: '#e63946', glow: 'rgba(230,57,70,0.15)' },
  ready: { dot: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  served: { dot: '#6b7280', glow: 'rgba(107,114,128,0.1)' },
};

export default function OrderDetailScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);

  // Real-time Convex subscription — updates live when kitchen changes status
  const order = useQuery(
    api.orders.getByOrderNumber,
    id ? { orderNumber: id } : 'skip',
  ) as (Order & { items?: ConvexOrderItem[] }) | null | undefined;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Loading
  if (order === undefined) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order #{id}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Not found
  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order #{id}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: 48 }}>{'🔍'}</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatus = (order.status ?? 'placed') as OrderStatus;
  const currentIdx = Math.max(0, ORDER_STEPS.findIndex((s) => s.key === orderStatus));
  const currentStep = ORDER_STEPS[currentIdx];
  const statusColor = STATUS_COLORS[orderStatus] ?? STATUS_COLORS.placed;
  const orderItems = order.items ?? [];

  const minutesSincePlaced = Math.round((Date.now() - order._creationTime) / 60000);
  const estTotal = currentStep.estimateMin + 5;
  const estRemaining = Math.max(0, estTotal - minutesSincePlaced);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{order.orderNumber}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Status hero */}
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.statusHero, { backgroundColor: statusColor.glow }]}>
          <View style={[styles.statusIconWrap, { backgroundColor: statusColor.dot }]}>
            <currentStep.icon size={28} color="#fff" />
          </View>
          <Text style={[styles.statusLabel, { color: statusColor.dot }]}>{currentStep.label}</Text>
          <Text style={[styles.statusLabelNe, { color: statusColor.dot }]}>{currentStep.labelNe}</Text>
          <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>{currentStep.description}</Text>
          {orderStatus !== 'served' && (
            <Animated.View entering={FadeIn.delay(200)} style={[styles.etaBadge, { backgroundColor: `${statusColor.dot}18` }]}>
              <Timer size={14} color={statusColor.dot} />
              <Text style={[styles.etaText, { color: statusColor.dot }]}>
                {estRemaining > 0 ? `~${estRemaining} min remaining` : 'Any moment now!'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Progress</Text>
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index < currentIdx;
            const isCurrent = index === currentIdx;
            const isUpcoming = index > currentIdx;
            const stepColor = isCompleted ? '#10b981' : isCurrent ? statusColor.dot : colors.border;

            return (
              <Animated.View key={step.key} entering={FadeInLeft.delay(150 + index * 80).duration(300)} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, { backgroundColor: stepColor }]}>
                    <step.icon size={13} color={isUpcoming ? colors.textSecondary : '#fff'} />
                  </View>
                  {index < ORDER_STEPS.length - 1 && (
                    <View style={[styles.line, { backgroundColor: isCompleted ? '#10b981' : colors.border }]} />
                  )}
                </View>
                <View style={[styles.timelineRight, index < ORDER_STEPS.length - 1 && { paddingBottom: 18 }]}>
                  <Text style={[styles.stepLabel, { color: isUpcoming ? colors.textSecondary : colors.text }, !isUpcoming && { fontWeight: '700' }]}>
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Animated.Text entering={SlideInRight.delay(300 + index * 80).duration(250)} style={[styles.stepCurrent, { color: statusColor.dot }]}>
                      {step.description}
                    </Animated.Text>
                  )}
                  {isCompleted && <Text style={[styles.stepDone, { color: '#10b981' }]}>Completed</Text>}
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Items */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.itemsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
          {orderItems.map((item, i) => (
            <Animated.View
              key={item._id ?? i}
              entering={FadeInDown.delay(250 + i * 50).duration(250)}
              style={[styles.orderItem, i < orderItems.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}
            >
              <View style={styles.orderItemLeft}>
                <View style={[styles.qtyBadge, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}x</Text>
                </View>
                <Text style={[styles.orderItemName, { color: colors.text }]}>{item.name}</Text>
              </View>
              <Text style={[styles.orderItemPrice, { color: colors.textSecondary }]}>
                Rs. {(item.totalPrice ?? item.unitPrice * item.quantity).toLocaleString()}
              </Text>
            </Animated.View>
          ))}

          <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>Rs. {order.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>VAT (13%)</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>Rs. {order.tax.toLocaleString()}</Text>
            </View>
            <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.grandLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.grandValue, { color: colors.primary }]}>Rs. {order.total.toLocaleString()}</Text>
            </View>
          </View>
        </Animated.View>

        {orderStatus !== 'served' && orderStatus !== 'placed' && (
          <Animated.View entering={FadeInDown.delay(400).duration(300)}>
            <Pressable
              style={[styles.payBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/payment?orderId=${order._id}&amount=${order.total}`)}
            >
              <CreditCard size={20} color="#fff" />
              <Text style={styles.payBtnText}>Pay Rs. {order.total.toLocaleString()}</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  statusHero: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  statusIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statusLabel: { fontSize: 22, fontWeight: '800' },
  statusLabelNe: { fontSize: 16, fontWeight: '600', marginTop: -4 },
  statusDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },
  etaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginTop: 8 },
  etaText: { fontSize: 13, fontWeight: '700' },
  timelineCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  timelineStep: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 26 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, minHeight: 18 },
  timelineRight: { flex: 1, paddingTop: 3 },
  stepLabel: { fontSize: 15 },
  stepCurrent: { fontSize: 13, marginTop: 3, fontWeight: '600' },
  stepDone: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  itemsCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  qtyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 13, fontWeight: '700' },
  orderItemName: { fontSize: 15, fontWeight: '600', flex: 1 },
  orderItemPrice: { fontSize: 14, fontWeight: '600' },
  totalSection: { borderTopWidth: 1, paddingTop: 12, marginTop: 4, gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 14, fontWeight: '600' },
  totalDivider: { height: 1, marginVertical: 2 },
  grandLabel: { fontSize: 17, fontWeight: '800' },
  grandValue: { fontSize: 20, fontWeight: '900' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 16, shadowColor: '#e63946', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
