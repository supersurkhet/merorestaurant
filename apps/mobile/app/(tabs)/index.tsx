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
  ArrowRight,
  Flame,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useCartStore } from '../../store/cart';
import { useI18n } from '../../lib/i18n';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.65;

// Featured items — will come from Convex
const FEATURED = [
  {
    id: '1',
    name: 'Chicken Momo',
    nameNe: 'चिकन मोमो',
    desc: 'Hand-folded dumplings with spicy achar',
    price: 250,
    emoji: '🥟',
    gradient: ['#dc2626', '#b91c1c'],
  },
  {
    id: '7',
    name: 'Thakali Set',
    nameNe: 'थकाली खाना सेट',
    desc: 'Authentic Thakali thali — a complete meal',
    price: 500,
    emoji: '🍛',
    gradient: ['#d97706', '#b45309'],
  },
  {
    id: '6',
    name: 'Tandoori Chicken',
    nameNe: 'तन्दुरी चिकन',
    desc: 'Clay oven roasted with yogurt spices',
    price: 550,
    emoji: '🍗',
    gradient: ['#ea580c', '#c2410c'],
  },
  {
    id: '9',
    name: 'Lassi',
    nameNe: 'लस्सी',
    desc: 'Creamy yogurt drink with cardamom',
    price: 150,
    emoji: '🥛',
    gradient: ['#0891b2', '#0e7490'],
  },
];

// Today's specials
const SPECIALS = [
  {
    id: 's1',
    name: 'Sekuwa Platter',
    nameNe: 'सेकुवा प्लेट',
    desc: 'Grilled meat platter with Surkhet special spices',
    price: 650,
    tag: "Chef's Pick",
    emoji: '🔥',
  },
  {
    id: 's2',
    name: 'Newari Khaja Set',
    nameNe: 'नेवारी खाजा सेट',
    desc: 'Traditional beaten rice set with choyla, bara & aloo',
    price: 400,
    tag: 'Popular',
    emoji: '🍽️',
  },
  {
    id: 's3',
    name: 'Sel Roti + Tea',
    nameNe: 'सेल रोटी + चिया',
    desc: 'Crispy ring bread with masala chiya',
    price: 120,
    tag: 'Snack',
    emoji: '🫖',
  },
];

function FeaturedCard({
  item,
  index,
}: {
  item: (typeof FEATURED)[0];
  index: number;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Animated.View entering={FadeInRight.delay(100 + index * 100).duration(400)}>
      <Pressable
        style={[styles.featuredCard, { backgroundColor: item.gradient[0] }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          addItem({ menuItemId: item.id, name: item.name, nameNe: item.nameNe, price: item.price });
        }}
      >
        <Text style={styles.featuredEmoji}>{item.emoji}</Text>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredName}>{item.name}</Text>
          <Text style={styles.featuredNameNe}>{item.nameNe}</Text>
          <Text style={styles.featuredDesc} numberOfLines={2}>{item.desc}</Text>
        </View>
        <View style={styles.featuredBottom}>
          <Text style={styles.featuredPrice}>Rs. {item.price}</Text>
          <View style={styles.addBadge}>
            <Text style={styles.addBadgeText}>+ Add</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const { t } = useI18n();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.itemCount());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroGreeting, { color: colors.textSecondary }]}>
                {t.home.welcome}
              </Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                मेरो रेस्टुरेन्ट
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.text }]}>
                Mero Restaurant
              </Text>
              <Text style={[styles.heroLocation, { color: colors.textSecondary }]}>
                Surkhet, Nepal 🇳🇵
              </Text>
            </View>
            <LanguageSwitcher />
          </View>
        </Animated.View>

        {/* Scan to Order — prominent CTA */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable
            style={styles.scanCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/scan');
            }}
          >
            <View style={styles.scanGlow}>
              <QrCode size={44} color="#fff" strokeWidth={1.5} />
            </View>
            <View style={styles.scanText}>
              <Text style={styles.scanTitle}>{t.home.scanQr}</Text>
              <Text style={styles.scanTitleNe}>{t.home.scanQrDesc}</Text>
              <Text style={styles.scanDesc}>
                QR Scan · WiFi · Menu
              </Text>
            </View>
            <ArrowRight size={22} color="#fff" style={{ opacity: 0.7 }} />
          </Pressable>
        </Animated.View>

        {/* Quick actions row */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickRow}>
          <Pressable
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#fff4e6' }]}>
              <UtensilsCrossed size={22} color="#d97706" />
            </View>
            <Text style={[styles.quickLabel, { color: colors.text }]}>Menu</Text>
          </Pressable>
          <Pressable
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#fef2f2' }]}>
              <ClipboardList size={22} color="#dc2626" />
            </View>
            <Text style={[styles.quickLabel, { color: colors.text }]}>Orders</Text>
          </Pressable>
          <Pressable
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/cart')}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#ecfdf5' }]}>
              <Text style={{ fontSize: 20 }}>🛒</Text>
            </View>
            <Text style={[styles.quickLabel, { color: colors.text }]}>
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Featured carousel */}
        <Animated.View entering={FadeIn.delay(300).duration(400)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Star size={18} color="#d97706" fill="#d97706" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/menu')}
              style={styles.seeAllBtn}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </Pressable>
          </View>

          <FlatList
            data={FEATURED}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            snapToInterval={CARD_W + 12}
            decelerationRate="fast"
            renderItem={({ item, index }) => (
              <FeaturedCard item={item} index={index} />
            )}
          />
        </Animated.View>

        {/* Today's Specials */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Flame size={18} color="#dc2626" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Specials</Text>
            </View>
          </View>

          <View style={styles.specialsList}>
            {SPECIALS.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(450 + index * 80).duration(300)}
              >
                <Pressable
                  style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addItem({
                      menuItemId: item.id,
                      name: item.name,
                      nameNe: item.nameNe,
                      price: item.price,
                    });
                  }}
                >
                  <Text style={styles.specialEmoji}>{item.emoji}</Text>
                  <View style={styles.specialInfo}>
                    <View style={styles.specialTop}>
                      <Text style={[styles.specialName, { color: colors.text }]}>{item.name}</Text>
                      <View style={[styles.specialTag, { backgroundColor: '#fef3c7' }]}>
                        <Text style={styles.specialTagText}>{item.tag}</Text>
                      </View>
                    </View>
                    <Text style={[styles.specialNameNe, { color: colors.textSecondary }]}>
                      {item.nameNe}
                    </Text>
                    <Text
                      style={[styles.specialDesc, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.desc}
                    </Text>
                    <Text style={[styles.specialPrice, { color: colors.primary }]}>
                      Rs. {item.price}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Footer tagline */}
        <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ in Surkhet
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Hero
  hero: { paddingHorizontal: 20, paddingTop: 8, marginBottom: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreeting: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  heroTitle: { fontSize: 36, fontWeight: '900', letterSpacing: -1, lineHeight: 42 },
  heroSubtitle: { fontSize: 20, fontWeight: '600', marginTop: -2 },
  heroLocation: { fontSize: 14, marginTop: 6 },

  // Scan CTA
  scanCard: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c2410c',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 20,
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
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
  scanTitleNe: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 1 },
  scanDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6, lineHeight: 17 },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 13, fontWeight: '700' },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 14, fontWeight: '600' },

  // Featured carousel
  carousel: { paddingHorizontal: 20, gap: 12, paddingRight: 40, marginBottom: 28 },
  featuredCard: {
    width: CARD_W,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredEmoji: { fontSize: 36, marginBottom: 8 },
  featuredInfo: { gap: 2 },
  featuredName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  featuredNameNe: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  featuredDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 17, marginTop: 4 },
  featuredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  featuredPrice: { color: '#fff', fontSize: 18, fontWeight: '800' },
  addBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Today's specials
  specialsList: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  specialCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    alignItems: 'center',
  },
  specialEmoji: { fontSize: 32 },
  specialInfo: { flex: 1, gap: 2 },
  specialTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  specialName: { fontSize: 16, fontWeight: '700' },
  specialTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  specialTagText: { fontSize: 10, fontWeight: '700', color: '#92400e' },
  specialNameNe: { fontSize: 12 },
  specialDesc: { fontSize: 12, lineHeight: 17 },
  specialPrice: { fontSize: 15, fontWeight: '800', marginTop: 2 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 13 },
});
