import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { CategoryPill } from '../../components/ui/CategoryPill';
import { MenuItemCard } from '../../components/ui/MenuItemCard';
import { CartFloatingButton } from '../../components/ui/CartFloatingButton';

// Demo data — will be replaced with Convex queries
const CATEGORIES = [
  { id: 'all', name: 'All', nameNe: 'सबै' },
  { id: 'momo', name: 'Momo', nameNe: 'मोमो' },
  { id: 'dal-bhat', name: 'Dal Bhat', nameNe: 'दालभात' },
  { id: 'tandoori', name: 'Tandoori', nameNe: 'तन्दुरी' },
  { id: 'thakali', name: 'Thakali', nameNe: 'थकाली' },
  { id: 'drinks', name: 'Drinks', nameNe: 'पेय' },
  { id: 'dessert', name: 'Desserts', nameNe: 'मिठाई' },
];

const MENU_ITEMS = [
  {
    id: '1',
    name: 'Chicken Momo (Steam)',
    nameNe: 'चिकन मोमो (स्टीम)',
    description: 'Hand-folded dumplings with tender chicken filling, served with spicy tomato achar',
    price: 250,
    category: 'momo',
    isSpicy: true,
  },
  {
    id: '2',
    name: 'Buff Momo (Fried)',
    nameNe: 'बफ मोमो (फ्राइड)',
    description: 'Crispy fried buffalo momo with special house sauce',
    price: 280,
    category: 'momo',
    isSpicy: true,
  },
  {
    id: '3',
    name: 'Veg Momo (Jhol)',
    nameNe: 'भेज मोमो (झोल)',
    description: 'Steamed vegetable dumplings in rich sesame-tomato soup',
    price: 200,
    category: 'momo',
    isVeg: true,
    isSpicy: true,
  },
  {
    id: '4',
    name: 'Dal Bhat Tarkari Set',
    nameNe: 'दालभात तरकारी सेट',
    description: 'Traditional Nepali thali with rice, lentil soup, seasonal vegetables, pickle & papad',
    price: 350,
    category: 'dal-bhat',
    isVeg: true,
  },
  {
    id: '5',
    name: 'Chicken Dal Bhat Set',
    nameNe: 'चिकन दालभात सेट',
    description: 'Full thali with spiced chicken curry, rice, dal, achar & salad',
    price: 450,
    category: 'dal-bhat',
  },
  {
    id: '6',
    name: 'Tandoori Chicken',
    nameNe: 'तन्दुरी चिकन',
    description: 'Clay oven roasted chicken marinated in yogurt & traditional spices',
    price: 550,
    category: 'tandoori',
    isSpicy: true,
  },
  {
    id: '7',
    name: 'Thakali Khana Set',
    nameNe: 'थकाली खाना सेट',
    description: 'Authentic Thakali thali — dal, bhat, gundruk, meat curry, ghee, pickles & more',
    price: 500,
    category: 'thakali',
  },
  {
    id: '8',
    name: 'Masala Tea',
    nameNe: 'मसला चिया',
    description: 'Hot Nepali tea brewed with cardamom, ginger & cinnamon',
    price: 80,
    category: 'drinks',
    isVeg: true,
  },
  {
    id: '9',
    name: 'Lassi (Sweet)',
    nameNe: 'लस्सी (मिठो)',
    description: 'Creamy yogurt drink blended with sugar and a touch of cardamom',
    price: 150,
    category: 'drinks',
    isVeg: true,
  },
  {
    id: '10',
    name: 'Juju Dhau',
    nameNe: 'जुजु धौ',
    description: 'King of yogurts — traditional Newari sweetened yogurt from Bhaktapur',
    price: 180,
    category: 'dessert',
    isVeg: true,
  },
];

export default function MenuScreen() {
  const colors = useThemeColor();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameNe?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          What would you like to eat?
        </Text>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search dishes..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category pills */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.name}
              isActive={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Menu items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <MenuItemCard
            id={item.id}
            name={item.name}
            nameNe={item.nameNe}
            description={item.description}
            price={item.price}
            isVeg={item.isVeg}
            isSpicy={item.isSpicy}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No dishes found
            </Text>
          </View>
        }
      />

      {/* Floating cart button */}
      <CartFloatingButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 4,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  categoriesWrapper: { paddingVertical: 12 },
  categories: { paddingHorizontal: 20, gap: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 160 },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16 },
});
