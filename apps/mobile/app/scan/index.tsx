import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, QrCode, Camera, Wifi, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { useQuery } from 'convex/react';
import { useSessionStore } from '../../store/session';
import { useCartStore } from '../../store/cart';
import { api } from '../../lib/convex-api';
import { RestaurantMiniMap } from '../../components/ui/RestaurantMap';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phase, setPhase] = useState<'scanning' | 'loading' | 'success'>('scanning');
  const startSession = useSessionStore((s) => s.startSession);
  const setTable = useCartStore((s) => s.setTable);

  // Convex query — activates after scan, returns { table, restaurant, wifi }
  const qrResult = useQuery(
    api.tables.getByQrCode,
    qrCode ? { qrCode } : 'skip',
  ) as { table: any; restaurant: any; wifi: any | null } | null | undefined;

  // Animated scan line
  const scanLineY = useSharedValue(-120);
  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(120, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-120, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [scanLineY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const pulse = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Parse QR — could be JSON or plain qrCode string
    let code: string;
    try {
      const parsed = JSON.parse(data);
      code = parsed.qrCode ?? parsed.tableId ?? data;
    } catch {
      code = data;
    }

    if (!code) {
      Alert.alert('Invalid QR', 'Not a valid restaurant QR code.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
      return;
    }

    console.log('[Scan] QR code:', code);
    setQrCode(code);
    setPhase('loading');

    pulse.value = withSequence(
      withTiming(1.3, { duration: 200 }),
      withTiming(1, { duration: 200 }),
    );
  }, [scanned, pulse]);

  // React to Convex query result
  useEffect(() => {
    if (phase !== 'loading' || qrResult === undefined) return;

    if (qrResult === null) {
      Alert.alert('Unknown QR Code', 'This QR code is not registered with any restaurant.', [
        { text: 'OK', onPress: () => { setScanned(false); setPhase('scanning'); setQrCode(null); } },
      ]);
      return;
    }

    const { table, restaurant, wifi } = qrResult;
    console.log('[Scan] Found:', { restaurant: restaurant?.name, table: table?.label, wifi: !!wifi });

    // Start session
    startSession({
      restaurantId: table.restaurantId,
      restaurantName: restaurant?.name ?? 'Restaurant',
      restaurantNameNe: restaurant?.nameNe,
      tableId: table._id,
      tableLabel: table.label,
      tableNumber: table.number,
      wifiSsid: wifi?.ssid,
      wifiPassword: wifi?.password,
    });

    // Also set cart table
    setTable(table._id, table.restaurantId);

    setPhase('success');

    // Navigate after showing success
    const timer = setTimeout(() => {
      if (wifi?.ssid) {
        Alert.alert(
          `Welcome! ${table.label}`,
          `Connect to WiFi "${wifi.ssid}" and start ordering?`,
          [
            { text: 'Connect & Order', onPress: () => { Linking.openURL('App-Prefs:WIFI').catch(() => {}); router.replace('/(tabs)/menu'); } },
            { text: 'Just Order', onPress: () => router.replace('/(tabs)/menu') },
          ],
        );
      } else {
        router.replace('/(tabs)/menu');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase, qrResult, startSession, setTable, router]);

  // Permission states
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Camera size={56} color="#d97706" strokeWidth={1.5} />
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permDesc}>We need your camera to scan restaurant QR codes</Text>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ padding: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Not Now</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // Loading / Success states
  if (phase === 'loading' || phase === 'success') {
    const table = qrResult?.table;
    const restaurant = qrResult?.restaurant;
    const wifi = qrResult?.wifi;
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Animated.View entering={SlideInDown.springify().damping(15)} style={{ alignItems: 'center', gap: 12 }}>
            <Animated.View style={pulseStyle}>
              <View style={styles.successIcon}>
                {phase === 'success' ? <CheckCircle2 size={48} color="#059669" /> : <QrCode size={48} color="#d97706" />}
              </View>
            </Animated.View>
            <Text style={styles.successTitle}>
              {phase === 'success' ? 'Connected!' : 'Looking up table...'}
            </Text>
            {restaurant && <Text style={styles.successRestaurant}>{restaurant.name}</Text>}
            {table && <Text style={styles.successTable}>{table.label}</Text>}
            {wifi?.ssid && (
              <View style={styles.wifiRow}>
                <Wifi size={14} color="#d97706" />
                <Text style={styles.wifiText}>WiFi: {wifi.ssid}</Text>
              </View>
            )}
            {/* Mini map if restaurant has coordinates */}
            {restaurant?.latitude && restaurant?.longitude && (
              <View style={{ width: '100%', marginTop: 8 }}>
                <RestaurantMiniMap restaurant={restaurant} />
              </View>
            )}
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // Camera scanning
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlayTop} />
      <View style={styles.overlayRow}>
        <View style={styles.overlaySide} />
        <View style={styles.cutout} />
        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom} />

      <View style={styles.viewfinder}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      </View>

      <SafeAreaView style={styles.uiOverlay}>
        <View style={styles.topBar}>
          <View style={styles.topBadge}>
            <QrCode size={16} color="#fff" />
            <Text style={styles.topBadgeText}>Scan Restaurant QR</Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color="#fff" />
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.bottomSheet}>
          <Text style={styles.instrTitle}>Point at Table QR Code</Text>
          <Text style={styles.instrText}>
            Every partner restaurant has QR codes on tables. Scan to see their menu, order, and pay.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const VF = 260;
const OVL = 'rgba(0,0,0,0.65)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  overlayTop: { flex: 1, backgroundColor: OVL },
  overlayRow: { flexDirection: 'row', height: VF },
  overlaySide: { flex: 1, backgroundColor: OVL },
  cutout: { width: VF },
  overlayBottom: { flex: 1, backgroundColor: OVL },
  viewfinder: { position: 'absolute', top: '50%', left: '50%', width: VF, height: VF, marginTop: -VF / 2, marginLeft: -VF / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: '#d97706', borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
  scanLine: { position: 'absolute', width: '85%', height: 2, backgroundColor: '#d97706', borderRadius: 1 },
  uiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  topBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(217,119,6,0.3)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  topBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  bottomSheet: { backgroundColor: 'rgba(15,15,26,0.92)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  instrTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  instrText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 22 },
  permTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  permDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center' },
  permBtn: { backgroundColor: '#d97706', paddingHorizontal: 36, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(5,150,105,0.12)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  successRestaurant: { color: '#d97706', fontSize: 20, fontWeight: '700' },
  successTable: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  wifiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(217,119,6,0.12)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  wifiText: { color: '#d97706', fontSize: 14, fontWeight: '600' },
});
