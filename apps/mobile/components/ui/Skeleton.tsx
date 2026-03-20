import { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useThemeColor();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function MenuItemSkeleton() {
  const colors = useThemeColor();
  return (
    <View style={[skeletonStyles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={skeletonStyles.menuInfo}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={18} />
        <Skeleton width="60%" height={12} />
        <Skeleton width="30%" height={18} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={100} height={100} borderRadius={14} />
    </View>
  );
}

export function MenuSkeleton() {
  return (
    <View style={skeletonStyles.menuList}>
      {[0, 1, 2, 3].map((i) => (
        <MenuItemSkeleton key={i} />
      ))}
    </View>
  );
}

export function OrderCardSkeleton() {
  const colors = useThemeColor();
  return (
    <View style={[skeletonStyles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={skeletonStyles.orderRow}>
        <Skeleton width="35%" height={16} />
        <Skeleton width={70} height={24} borderRadius={8} />
      </View>
      <Skeleton width="70%" height={12} />
      <Skeleton width="50%" height={12} />
      <View style={skeletonStyles.orderRow}>
        <Skeleton width="25%" height={18} />
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
    </View>
  );
}

export function OrdersSkeleton() {
  return (
    <View style={skeletonStyles.ordersList}>
      {[0, 1, 2].map((i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  menuList: { paddingHorizontal: 20, gap: 12 },
  menuCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  menuInfo: { flex: 1, gap: 8, justifyContent: 'center' },
  ordersList: { paddingHorizontal: 20, gap: 12 },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
