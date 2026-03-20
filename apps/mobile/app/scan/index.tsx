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
import { useCartStore } from '../../store/cart';

interface QrPayload {
  restaurantId: string;
  tableId: string;
  tableNumber?: number;
  tableLabel?: string;
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WPA2' | 'WEP' | 'nopass';
}

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<QrPayload | null>(null);
  const [phase, setPhase] = useState<'scanning' | 'success' | 'connecting'>('scanning');
  const setTable = useCartStore((s) => s.setTable);

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

  // Pulse animation for success icon
  const pulse = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const generateWifiUri = useCallback((payload: QrPayload): string | null => {
    if (!payload.ssid) return null;
    const enc = payload.encryption ?? 'WPA2';
    const pass = payload.password ?? '';
    return `WIFI:T:${enc};S:${payload.ssid};P:${pass};;`;
  }, []);

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let payload: QrPayload;
    try {
      payload = JSON.parse(data);
      if (!payload.restaurantId || !payload.tableId) {
        throw new Error('Missing required fields');
      }
    } catch {
      Alert.alert(
        'Invalid QR Code',
        'This doesn\'t look like a Mero Restaurant table QR code. Please try scanning the QR on your table.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }],
      );
      return;
    }

    setScanResult(payload);
    setPhase('success');

    // Pulse the success icon
    pulse.value = withSequence(
      withTiming(1.3, { duration: 200 }),
      withTiming(1, { duration: 200 }),
    );

    // Store table in cart
    setTable(payload.tableId, payload.restaurantId);

    // After showing success, offer WiFi or go to menu
    const wifiUri = generateWifiUri(payload);
    const tableLabel = payload.tableLabel ?? `Table ${payload.tableNumber ?? ''}`;

    setTimeout(() => {
      if (wifiUri && payload.ssid) {
        setPhase('connecting');
        Alert.alert(
          `Welcome to ${tableLabel}!`,
          `Connect to WiFi "${payload.ssid}" and start ordering?`,
          [
            {
              text: 'Connect & Order',
              onPress: () => {
                // On iOS/Android, opening a wifi: URI isn't universal,
                // but we can try via Settings or just navigate to menu
                Linking.openURL(`App-Prefs:WIFI`).catch(() => {});
                router.replace('/(tabs)/menu');
              },
            },
            {
              text: 'Just Order',
              onPress: () => router.replace('/(tabs)/menu'),
            },
          ],
        );
      } else {
        setTimeout(() => router.replace('/(tabs)/menu'), 1200);
      }
    }, 1500);
  }, [scanned, setTable, generateWifiUri, router, pulse]);

  // Permission loading
  if (!permission) {
    return <View style={styles.container} />;
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.permissionCard}>
            <View style={styles.permIconWrap}>
              <Camera size={56} color="#d97706" strokeWidth={1.5} />
            </View>
            <Text style={styles.permTitle}>Camera Access Needed</Text>
            <Text style={styles.permDesc}>
              We need your camera to scan the QR code on your table
            </Text>
            <Pressable style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permBtnText}>Allow Camera</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.permCancel}>
              <Text style={styles.permCancelText}>Not Now</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // Success phase
  if (phase === 'success' || phase === 'connecting') {
    const tableLabel = scanResult?.tableLabel ?? `Table ${scanResult?.tableNumber ?? ''}`;
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.successCard}>
            <Animated.View style={pulseStyle}>
              <View style={styles.successIconWrap}>
                {phase === 'connecting' ? (
                  <Wifi size={48} color="#059669" />
                ) : (
                  <CheckCircle2 size={48} color="#059669" />
                )}
              </View>
            </Animated.View>
            <Text style={styles.successTitle}>
              {phase === 'connecting' ? 'Connecting...' : 'Table Found!'}
            </Text>
            <Text style={styles.successTable}>{tableLabel}</Text>
            {scanResult?.ssid && (
              <View style={styles.wifiInfo}>
                <Wifi size={16} color="#92400e" />
                <Text style={styles.wifiText}>
                  WiFi: {scanResult.ssid}
                </Text>
              </View>
            )}
            <Text style={styles.successHint}>
              {phase === 'connecting'
                ? 'Setting up your connection...'
                : 'Taking you to the menu...'}
            </Text>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // Camera scanning phase
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark overlay with cutout effect */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayRow}>
        <View style={styles.overlaySide} />
        <View style={styles.viewfinderCutout} />
        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom} />

      {/* Viewfinder corners + scan line */}
      <View style={styles.viewfinderAbsolute}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
        <QrCode size={36} color="rgba(255,255,255,0.15)" />
      </View>

      <SafeAreaView style={styles.uiOverlay}>
        {/* Close button */}
        <View style={styles.topBar}>
          <View style={styles.topBarBadge}>
            <QrCode size={16} color="#fff" />
            <Text style={styles.topBarText}>Scan QR</Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Bottom instructions */}
        <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.bottomSheet}>
          <Text style={styles.instrTitle}>Point at Your Table</Text>
          <Text style={styles.instrText}>
            Each table has a QR code. Scan it to auto-connect to WiFi and start ordering instantly.
          </Text>
          <View style={styles.instrSteps}>
            <View style={styles.instrStep}>
              <View style={styles.instrStepDot}>
                <Text style={styles.instrStepNum}>1</Text>
              </View>
              <Text style={styles.instrStepText}>Scan QR</Text>
            </View>
            <View style={styles.instrDivider} />
            <View style={styles.instrStep}>
              <View style={styles.instrStepDot}>
                <Text style={styles.instrStepNum}>2</Text>
              </View>
              <Text style={styles.instrStepText}>Connect WiFi</Text>
            </View>
            <View style={styles.instrDivider} />
            <View style={styles.instrStep}>
              <View style={styles.instrStepDot}>
                <Text style={styles.instrStepNum}>3</Text>
              </View>
              <Text style={styles.instrStepText}>Order Food</Text>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const VIEWFINDER_SIZE = 260;
const OVERLAY_BG = 'rgba(0,0,0,0.65)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  // Dark overlay pieces around viewfinder
  overlayTop: { flex: 1, backgroundColor: OVERLAY_BG },
  overlayRow: { flexDirection: 'row', height: VIEWFINDER_SIZE },
  overlaySide: { flex: 1, backgroundColor: OVERLAY_BG },
  viewfinderCutout: { width: VIEWFINDER_SIZE },
  overlayBottom: { flex: 1, backgroundColor: OVERLAY_BG },

  // Viewfinder absolute positioned over cutout
  viewfinderAbsolute: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    marginTop: -VIEWFINDER_SIZE / 2,
    marginLeft: -VIEWFINDER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#d97706',
    borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
  scanLine: {
    position: 'absolute',
    width: '85%',
    height: 2,
    backgroundColor: '#d97706',
    borderRadius: 1,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  // UI overlay
  uiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  topBarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217,119,6,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topBarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom sheet instructions
  bottomSheet: {
    backgroundColor: 'rgba(15,15,26,0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  instrTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  instrText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  instrSteps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  instrStep: { alignItems: 'center', gap: 6 },
  instrStepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instrStepNum: { color: '#fff', fontSize: 13, fontWeight: '800' },
  instrStepText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  instrDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 12,
    marginBottom: 20,
  },

  // Permission screen
  permissionCard: { alignItems: 'center', gap: 16 },
  permIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(217,119,6,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  permDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  permBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  permCancel: { paddingVertical: 12 },
  permCancelText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },

  // Success screen
  successCard: { alignItems: 'center', gap: 12 },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(5,150,105,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  successTable: { color: '#d97706', fontSize: 20, fontWeight: '700' },
  wifiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217,119,6,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  wifiText: { color: '#d97706', fontSize: 14, fontWeight: '600' },
  successHint: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 },
});
