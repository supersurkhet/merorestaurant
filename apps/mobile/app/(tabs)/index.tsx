import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  QrCode,
  UtensilsCrossed,
  ClipboardList,
  Flame,
  Star,
  ChevronRight,
  Wifi,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQuery } from 'convex/react';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useCartStore } from '../../store/cart';
import { useSessionStore } from '../../store/session';
import { useI18n } from '../../lib/i18n';
import { api } from '../../lib/convex-api';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { RestaurantMap } from '../../components/ui/RestaurantMap';
import type { MenuItem, Restaurant, Id } from '../../lib/convex-types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.65;

const GRADIENT_COLORS = [
  '#dc2626', '#d97706', '#ea580c', '#0891b2', '#7c3aed', '#059669',
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const { t } = useI18n();
  const session = useSessionStore();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.itemCount());

  // Browse all active restaurants (shown when no session)
  const restaurants = useQuery(
    api.restaurants.getActive,
    !session.isActive ? {} : 'skip',
  ) as Restaurant[] | undefined;

  // Only query menu if we have a session (after QR scan)
  const menuItems = useQuery(
    api.menuItems.listByRestaurant,
    session.restaurantId
      ? { restaurantId: session.restaurantId as Id<'restaurants'>, onlyAvailable: true }
      : 'skip',
  ) as MenuItem[] | undefined;

  const featured = menuItems?.slice(0, 4) ?? [];
  const specials = menuItems?.slice(4, 7) ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with language switcher */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                {session.isActive ? session.restaurantName : 'MeroRestaurant'}
              </Text>
              {session.isActive && session.restaurantNameNe && (
                <Text style={[styles.heroTitleNe, { color: colors.textSecondary }]}>
                  {session.restaurantNameNe}
                </Text>
              )}
              {!session.isActive && (
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                  Scan a restaurant QR to start ordering
                </Text>
              )}
              {session.isActive && session.tableLabel && (
                <View style={styles.tableBadge}>
                  <Text style={[styles.tableBadgeText, { color: colors.primary }]}>
                    {session.tableLabel}
                  </Text>
                  {session.wifiSsid && (
                    <>
                      <Wifi size={12} color={colors.success} />
                      <Text style={[styles.wifiBadgeText, { color: colors.success }]}>
                        {session.wifiSsid}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>
            <LanguageSwitcher />
          </View>
        </Animated.View>

        {/* QR Scan CTA — always prominent */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable
            style={[styles.scanCard, { backgroundColor: session.isActive ? '#059669' : '#c2410c' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/scan');
            }}
          >
            <View style={styles.scanGlow}>
              <QrCode size={44} color="#fff" strokeWidth={1.5} />
            </View>
            <View style={styles.scanText}>
              <Text style={styles.scanTitle}>
                {session.isActive ? 'Scan Another Table' : 'Scan QR to Start'}
              </Text>
              <Text style={styles.scanDesc}>
                {session.isActive
                  ? 'Switch table or restaurant'
                  : 'Point camera at restaurant table QR code'}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Quick actions — only show if session active */}
        {session.isActive && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickRow}>
            <Pressable
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/menu')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#fff4e6' }]}>
                <UtensilsCrossed size={22} color="#d97706" />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{t.home.browseMenu}</Text>
            </Pressable>
            <Pressable
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/orders')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#fef2f2' }]}>
                <ClipboardList size={22} color="#dc2626" />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{t.home.myOrders}</Text>
            </Pressable>
            <Pressable
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/cart')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#ecfdf5' }]}>
                <Text style={{ fontSize: 20 }}>{'🛒'}</Text>
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>
                {t.cart.title}{cartCount > 0 ? ` (${cartCount})` : ''}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Featured items — only if session active and items loaded */}
        {session.isActive && featured.length > 0 && (
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Star size={18} color="#d97706" fill="#d97706" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/menu')} style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </View>
            <FlatList
              data={featured}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
              snapToInterval={CARD_W + 12}
              decelerationRate="fast"
              renderItem={({ item, index }) => {
                const bg = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                return (
                  <Animated.View entering={FadeInRight.delay(100 + index * 100).duration(400)}>
                    <Pressable
                      style={[styles.featuredCard, { backgroundColor: bg }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        addItem({ menuItemId: item._id, name: item.name, nameNe: item.nameNe, price: item.price });
                      }}
                    >
                      <Text style={styles.featuredEmoji}>
                        {item.isVeg ? '🥬' : item.isSpicy ? '🌶️' : '🍽️'}
                      </Text>
                      <Text style={styles.featuredName}>{item.name}</Text>
                      <Text style={styles.featuredNameNe}>{item.nameNe}</Text>
                      <View style={styles.featuredBottom}>
                        <Text style={styles.featuredPrice}>Rs. {item.price}</Text>
                        <View style={styles.addBadge}>
                          <Text style={styles.addBadgeText}>+ Add</Text>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              }}
            />
          </Animated.View>
        )}

        {/* Today's specials */}
        {session.isActive && specials.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Flame size={18} color="#dc2626" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Specials</Text>
              </View>
            </View>
            <View style={styles.specialsList}>
              {specials.map((item: MenuItem, index: number) => (
                <Animated.View key={item._id} entering={FadeInDown.delay(450 + index * 80).duration(300)}>
                  <Pressable
                    style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addItem({ menuItemId: item._id, name: item.name, nameNe: item.nameNe, price: item.price });
                    }}
                  >
                    <Text style={styles.specialEmoji}>
                      {item.isVeg ? '🥬' : item.isSpicy ? '🌶️' : '🍛'}
                    </Text>
                    <View style={styles.specialInfo}>
                      <Text style={[styles.specialName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.specialNameNe, { color: colors.textSecondary }]}>{item.nameNe}</Text>
                      <Text style={[styles.specialPrice, { color: colors.primary }]}>Rs. {item.price}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* No session — QR prompt + browse restaurants */}
        {!session.isActive && (
          <>
            <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.emptyState}>
              <Text style={{ fontSize: 64 }}>{'🍽️'}</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Ready to dine?</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Scan the QR code at any partner restaurant to view their menu, order food, and pay — all from your phone.
              </Text>
            </Animated.View>

            {/* Browse restaurants near you */}
            {restaurants && restaurants.length > 0 && (
              <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.restaurantSection}>
                <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20, marginBottom: 14 }]}>
                  Restaurants Near You
                </Text>
                {/* Map view for restaurants with coordinates */}
                <RestaurantMap restaurants={restaurants} />
                {restaurants.map((r: Restaurant) => (
                  <Pressable
                    key={r._id}
                    style={[styles.restaurantCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={[styles.restaurantAvatar, { backgroundColor: colors.primaryLight }]}>
                      <Text style={{ fontSize: 24 }}>{'🏪'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.restaurantName, { color: colors.text }]}>{r.name}</Text>
                      {r.nameNe && (
                        <Text style={[styles.restaurantNameNe, { color: colors.textSecondary }]}>{r.nameNe}</Text>
                      )}
                      <Text style={[styles.restaurantAddr, { color: colors.textSecondary }]}>
                        {r.address ?? 'Scan QR at this restaurant to order'}
                      </Text>
                    </View>
                    <QrCode size={20} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </Animated.View>
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Powered by MeroRestaurant
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  hero: { paddingHorizontal: 20, paddingTop: 8, marginBottom: 20 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  heroTitleNe: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  heroSubtitle: { fontSize: 14, marginTop: 6 },
  tableBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  tableBadgeText: { fontSize: 14, fontWeight: '700' },
  wifiBadgeText: { fontSize: 12, fontWeight: '600' },
  scanCard: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  scanGlow: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: { flex: 1 },
  scanTitle: { color: '#fff', fontSize: 19, fontWeight: '800' },
  scanDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  quickRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 14, fontWeight: '600' },
  carousel: { paddingHorizontal: 20, gap: 12, paddingRight: 40, marginBottom: 28 },
  featuredCard: { width: CARD_W, borderRadius: 20, padding: 20, minHeight: 160, justifyContent: 'space-between' },
  featuredEmoji: { fontSize: 32, marginBottom: 8 },
  featuredName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  featuredNameNe: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12 },
  featuredBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPrice: { color: '#fff', fontSize: 18, fontWeight: '800' },
  addBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  addBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  specialsList: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  specialCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 14, gap: 14, alignItems: 'center' },
  specialEmoji: { fontSize: 32 },
  specialInfo: { flex: 1, gap: 2 },
  specialName: { fontSize: 16, fontWeight: '700' },
  specialNameNe: { fontSize: 12 },
  specialPrice: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40, gap: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '800' },
  emptyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  restaurantSection: { marginBottom: 20 },
  restaurantCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, borderRadius: 16, borderWidth: 1, gap: 14, marginBottom: 10 },
  restaurantAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  restaurantName: { fontSize: 16, fontWeight: '700' },
  restaurantNameNe: { fontSize: 12, marginTop: 1 },
  restaurantAddr: { fontSize: 13, marginTop: 4 },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 13 },
});
