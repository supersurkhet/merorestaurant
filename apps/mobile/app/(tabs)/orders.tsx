import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClipboardList, ChevronRight, Clock, CheckCircle2 } from 'lucide-react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served';

interface Order {
  id: string;
  status: OrderStatus;
  items: string[];
  total: number;
  createdAt: string;
  table: string;
}

// Demo data — will come from Convex subscription
const DEMO_ORDERS: Order[] = [
  {
    id: '1001',
    status: 'preparing',
    items: ['Chicken Momo x2', 'Dal Bhat Set', 'Masala Tea x2'],
    total: 1010,
    createdAt: new Date().toISOString(),
    table: 'Table 5',
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  placed: { label: 'Placed', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bg: '#dbeafe' },
  preparing: { label: 'Preparing', color: '#e63946', bg: '#fee2e2' },
  ready: { label: 'Ready', color: '#10b981', bg: '#ecfdf5' },
  served: { label: 'Served', color: '#6b7280', bg: '#f3f4f6' },
};

function OrderCard({ order }: { order: Order }) {
  const colors = useThemeColor();
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/order/${order.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          {order.status === 'preparing' ? (
            <Clock size={12} color={statusConfig.color} />
          ) : (
            <CheckCircle2 size={12} color={statusConfig.color} />
          )}
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <Text style={[styles.tableName, { color: colors.textSecondary }]}>{order.table}</Text>

      <Text style={[styles.itemsList, { color: colors.textSecondary }]} numberOfLines={2}>
        {order.items.join(' · ')}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.total, { color: colors.primary }]}>
          Rs. {order.total.toLocaleString()}
        </Text>
        <ChevronRight size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const colors = useThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your current and past orders
        </Text>
      </View>

      {DEMO_ORDERS.length > 0 ? (
        <FlatList
          data={DEMO_ORDERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      ) : (
        <View style={styles.empty}>
          <ClipboardList size={64} color={colors.border} strokeWidth={1} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Scan a table QR code to start ordering
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  tableName: { fontSize: 13, fontWeight: '500' },
  itemsList: { fontSize: 14, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total: { fontSize: 18, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
