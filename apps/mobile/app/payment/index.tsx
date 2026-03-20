import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Shield, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '../../hooks/useThemeColor';

type PaymentMethod = 'khalti' | 'esewa' | 'fonepay' | 'cash';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  nameNe: string;
  color: string;
  description: string;
}[] = [
  {
    id: 'khalti',
    name: 'Khalti',
    nameNe: 'खल्ती',
    color: '#5C2D91',
    description: 'Pay with Khalti digital wallet',
  },
  {
    id: 'esewa',
    name: 'eSewa',
    nameNe: 'इसेवा',
    color: '#60BB46',
    description: 'Pay with eSewa mobile wallet',
  },
  {
    id: 'fonepay',
    name: 'Fonepay',
    nameNe: 'फोनपे',
    color: '#E2231A',
    description: 'Scan & pay with Fonepay QR',
  },
  {
    id: 'cash',
    name: 'Cash',
    nameNe: 'नगद',
    color: '#6b7280',
    description: 'Pay at the counter',
  },
];

export default function PaymentScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { orderId, amount } = useLocalSearchParams<{ orderId: string; amount: string }>();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setProcessing(true);

    // Will integrate with @nabwin/paisa for real payment flow
    // For now, simulate a payment
    setTimeout(() => {
      setProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/order/${orderId ?? '1001'}`);
    }, 2000);
  };

  const total = amount ? parseInt(amount, 10) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={[styles.amountCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.amountLabel, { color: colors.primary }]}>Total Amount</Text>
          <Text style={[styles.amountValue, { color: colors.primary }]}>
            Rs. {total.toLocaleString()}
          </Text>
          <Text style={[styles.amountNote, { color: colors.primary }]}>
            Order #{orderId ?? '—'}
          </Text>
        </View>

        {/* Payment methods */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose Payment Method
        </Text>

        <View style={styles.methods}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selected === method.id;
            return (
              <Pressable
                key={method.id}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? method.color : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(method.id);
                }}
              >
                <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
                  <CreditCard size={20} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                  <Text style={[styles.methodNameNe, { color: colors.textSecondary }]}>
                    {method.nameNe}
                  </Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>
                    {method.description}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: method.color }]}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Shield size={16} color={colors.success} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Your payment is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable
          style={[
            styles.payBtn,
            { backgroundColor: selected ? colors.primary : colors.border },
          ]}
          onPress={handlePay}
          disabled={!selected || processing}
        >
          <Text style={[styles.payBtnText, { opacity: selected ? 1 : 0.5 }]}>
            {processing ? 'Processing...' : `Pay Rs. ${total.toLocaleString()}`}
          </Text>
        </Pressable>
      </View>
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
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, gap: 20, paddingBottom: 120 },
  amountCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 4 },
  amountLabel: { fontSize: 14, fontWeight: '600' },
  amountValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  amountNote: { fontSize: 13, opacity: 0.7 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  methods: { gap: 12 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: '700' },
  methodNameNe: { fontSize: 12, marginTop: 1 },
  methodDesc: { fontSize: 13, marginTop: 2 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: { fontSize: 13 },
  footer: { padding: 20, borderTopWidth: 0.5 },
  payBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
