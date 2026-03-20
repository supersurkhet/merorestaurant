import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
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
import { initiateKhaltiPayment, initiateEsewaPayment, getFonepayQrUrl } from '../../lib/payment';

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
  const { orderId, amount, orderNumber } = useLocalSearchParams<{
    orderId: string;
    amount: string;
    orderNumber: string;
  }>();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const createPayment = useMutation(api.payments.createPayment);
  const updatePaymentStatus = useMutation(api.payments.updateStatus);

  const total = amount ? parseInt(amount, 10) : 0;

  const handlePay = async () => {
    if (!selected || !orderId || !restaurantId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setProcessing(true);
    console.log('[Payment] Starting payment:', { method: selected, orderId, amount: total });

    try {
      // Create payment record in Convex
      const paymentId = await createPayment({
        restaurantId: restaurantId as Id<'restaurants'>,
        orderId: orderId as Id<'orders'>,
        method: selected,
        amount: total,
      });
      console.log('[Payment] Convex payment created:', paymentId);

      if (selected === 'cash') {
        // Cash: mark as pending, show counter message
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t.payment.paymentSuccess, t.payment.cashNote, [
          { text: 'OK', onPress: () => router.dismiss() },
        ]);
      } else if (selected === 'khalti') {
        // Khalti: initiate via paisa SDK, open payment URL
        try {
          const khaltiRes = await initiateKhaltiPayment({
            orderId,
            orderNumber: orderNumber ?? orderId,
            amount: total,
          });
          // Open Khalti payment page in browser/WebView
          await Linking.openURL(khaltiRes.paymentUrl);
          // On return (via deep link), the payment callback will verify
          // For now, mark as completed optimistically
          await updatePaymentStatus({
            id: paymentId as Id<'payments'>,
            status: 'completed',
            transactionId: khaltiRes.pidx,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.dismiss();
        } catch (err) {
          console.log('[Payment] Khalti error:', err);
          await updatePaymentStatus({ id: paymentId as Id<'payments'>, status: 'failed' });
          Alert.alert(t.common.error, t.payment.paymentFailed);
        }
      } else if (selected === 'esewa') {
        // eSewa: get form data, open payment URL
        try {
          const esewaForm = await initiateEsewaPayment({
            orderId,
            amount: total,
            taxAmount: Math.round(total * 0.13),
          });
          await Linking.openURL(esewaForm.actionUrl);
          await updatePaymentStatus({
            id: paymentId as Id<'payments'>,
            status: 'completed',
            transactionId: orderId,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.dismiss();
        } catch (err) {
          console.log('[Payment] eSewa error:', err);
          await updatePaymentStatus({ id: paymentId as Id<'payments'>, status: 'failed' });
          Alert.alert(t.common.error, t.payment.paymentFailed);
        }
      } else if (selected === 'fonepay') {
        // Fonepay: open QR payment URL
        const fonepayUrl = getFonepayQrUrl({ amount: total, orderId });
        await Linking.openURL(fonepayUrl);
        await updatePaymentStatus({
          id: paymentId as Id<'payments'>,
          status: 'completed',
          transactionId: `fonepay-${orderId}`,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.dismiss();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.payment.paymentFailed;
      console.log('[Payment] Error:', msg);
      Alert.alert(t.common.error, msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.payment.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.amountCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.amountLabel, { color: colors.primary }]}>{t.payment.totalAmount}</Text>
          <Text style={[styles.amountValue, { color: colors.primary }]}>Rs. {total.toLocaleString()}</Text>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.payment.chooseMethod}</Text>

        <View style={styles.methods}>
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selected === method.id;
            const Icon = method.icon;
            return (
              <Animated.View key={method.id} entering={FadeInDown.delay(100 + index * 60).duration(300)}>
                <Pressable
                  style={[styles.methodCard, { backgroundColor: colors.card, borderColor: isSelected ? method.color : colors.border, borderWidth: isSelected ? 2 : 1 }]}
                  onPress={() => { Haptics.selectionAsync(); setSelected(method.id); }}
                >
                  <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
                    <Icon size={22} color={method.color} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                    <Text style={[styles.methodNameNe, { color: colors.textSecondary }]}>{method.nameNe}</Text>
                    <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>{t.payment[method.descKey]}</Text>
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

        <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.securityNote}>
          <Shield size={16} color={colors.success} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>{t.payment.secure}</Text>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.payBtn, { backgroundColor: selected ? colors.primary : colors.border }]}
          onPress={handlePay}
          disabled={!selected || processing}
        >
          <Text style={[styles.payBtnText, { opacity: selected ? 1 : 0.5 }]}>
            {processing ? t.payment.processing : `${t.payment.pay} Rs. ${total.toLocaleString()}`}
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
  payBtn: { borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#e63946', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
