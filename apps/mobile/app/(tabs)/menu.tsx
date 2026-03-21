import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { useThemeColor } from '../../hooks/useThemeColor';
import { MenuSkeleton } from '../../components/ui/Skeleton';
import { CategoryPill } from '../../components/ui/CategoryPill';
import { MenuItemCard } from '../../components/ui/MenuItemCard';
import { CartFloatingButton } from '../../components/ui/CartFloatingButton';
import { useSessionStore } from '../../store/session';
import { api } from '../../lib/convex-api';
import type { Category, MenuItem, Id } from '../../lib/convex-types';

export default function MenuScreen() {
  const colors = useThemeColor();
  const restaurantId = useSessionStore((s) => s.restaurantId);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Convex queries — return undefined while loading, null/[] when loaded
  const categories = useQuery(
    api.categories.listByRestaurant,
    restaurantId ? { restaurantId: restaurantId as Id<'restaurants'> } : 'skip',
  ) as Category[] | undefined;

  const menuItems = useQuery(
    api.menuItems.listByRestaurant,
    restaurantId ? { restaurantId: restaurantId as Id<'restaurants'>, onlyAvailable: true } : 'skip',
  ) as MenuItem[] | undefined;

  const isLoading = categories === undefined || menuItems === undefined;

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.categoryId === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameNe && item.nameNe.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // Build category list with "All" prepended
  const categoryList = useMemo(() => {
    const all = { _id: 'all', name: 'All', nameNe: 'सबै' };
    if (!categories) return [all];
    return [all, ...categories.map((c) => ({ _id: c._id, name: c.name, nameNe: c.nameNe ?? c.name }))];
  }, [categories]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          What would you like to eat?
        </Text>

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
          {categoryList.map((cat) => (
            <CategoryPill
              key={cat._id}
              label={cat.name}
              isActive={activeCategory === cat._id}
              onPress={() => setActiveCategory(cat._id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Menu items */}
      {isLoading ? (
        <MenuSkeleton />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <MenuItemCard
              id={item._id}
              name={item.name}
              nameNe={item.nameNe}
              description={item.description}
              price={item.price}
              image={item.imageUrl ?? undefined}
              isVeg={item.isVeg}
              isSpicy={false}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>🍽️</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No dishes match your search' : 'No dishes available right now'}
              </Text>
            </View>
          }
        />
      )}

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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15 },
  emptyState: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
