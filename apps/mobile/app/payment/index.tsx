import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Shield, Wallet, Banknote, QrCode, Smartphone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useMutation } from 'convex/react';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useRestaurant } from '../../lib/restaurant-context';
import { useI18n } from '../../lib/i18n';
import { api } from '../../lib/convex-api';
import type { Id } from '../../lib/convex-types';

type PaymentMethod = 'khalti' | 'esewa' | 'fonepay' | 'cash';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  nameNe: string;
  color: string;
  icon: typeof Wallet;
  descKey: keyof typeof import('../../lib/i18n/en').en.payment;
}[] = [
  { id: 'khalti', name: 'Khalti', nameNe: '\u0916\u0932\u094D\u0924\u0940', color: '#5C2D91', icon: Wallet, descKey: 'khalti' },
  { id: 'esewa', name: 'eSewa', nameNe: '\u0907\u0938\u0947\u0935\u093E', color: '#60BB46', icon: Smartphone, descKey: 'esewa' },
  { id: 'fonepay', name: 'Fonepay', nameNe: '\u092B\u094B\u0928\u092A\u0947', color: '#E2231A', icon: QrCode, descKey: 'fonepay' },
  { id: 'cash', name: 'Cash', nameNe: '\u0928\u0917\u0926', color: '#6b7280', icon: Banknote, descKey: 'cash' },
];

export default function PaymentScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const { t } = useI18n();
  const { restaurantId } = useRestaurant();
  const { orderId, amount } = useLocalSearchParams<{ orderId: string; amount: string }>();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const createPayment = useMutation(api.payments.createPayment);

  const total = amount ? parseInt(amount, 10) : 0;

  const handlePay = async () => {
    if (!selected || !orderId || !restaurantId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setProcessing(true);

    try {
      await createPayment({
        restaurantId: restaurantId as Id<'restaurants'>,
        orderId: orderId as Id<'orders'>,
        method: selected,
        amount: total,
      });

      if (selected === 'cash') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          t.payment.paymentSuccess,
          t.payment.cashNote,
          [{ text: 'OK', onPress: () => router.dismiss() }],
        );
      } else {
        // For digital wallets, we'd open WebView/deep link here
        // For now, simulate successful payment
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          t.payment.paymentSuccess,
          `${selected.charAt(0).toUpperCase() + selected.slice(1)} payment recorded`,
          [{ text: 'OK', onPress: () => router.dismiss() }],
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.payment.paymentFailed;
      Alert.alert(t.common.error, msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.payment.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount hero */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.amountCard, { backgroundColor: colors.primaryLight }]}
        >
          <Text style={[styles.amountLabel, { color: colors.primary }]}>{t.payment.totalAmount}</Text>
          <Text style={[styles.amountValue, { color: colors.primary }]}>
            Rs. {total.toLocaleString()}
          </Text>
        </Animated.View>

        {/* Payment methods */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t.payment.chooseMethod}
        </Text>

        <View style={styles.methods}>
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selected === method.id;
            const Icon = method.icon;
            return (
              <Animated.View key={method.id} entering={FadeInDown.delay(100 + index * 60).duration(300)}>
                <Pressable
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
                    <Icon size={22} color={method.color} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                    <Text style={[styles.methodNameNe, { color: colors.textSecondary }]}>
                      {method.nameNe}
                    </Text>
                    <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>
                      {t.payment[method.descKey]}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: method.color }]}>
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Security note */}
        <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.securityNote}>
          <Shield size={16} color={colors.success} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            {t.payment.secure}
          </Text>
        </Animated.View>
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
            {processing
              ? t.payment.processing
              : `${t.payment.pay} Rs. ${total.toLocaleString()}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, gap: 20, paddingBottom: 120 },
  amountCard: { borderRadius: 20, padding: 28, alignItems: 'center', gap: 4 },
  amountLabel: { fontSize: 14, fontWeight: '600' },
  amountValue: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  methods: { gap: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 14 },
  methodIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 17, fontWeight: '700' },
  methodNameNe: { fontSize: 12, marginTop: 1 },
  methodDesc: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  securityText: { fontSize: 13 },
  footer: { padding: 20, borderTopWidth: 0.5 },
  payBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
