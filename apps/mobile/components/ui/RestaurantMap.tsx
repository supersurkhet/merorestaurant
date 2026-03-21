import { View, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import type { Restaurant } from '../../lib/convex-types';

// react-native-maps doesn't work on web — lazy import with fallback
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

try {
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Callout = Maps.Callout;
  }
} catch {
  // Maps not available
}

interface Props {
  restaurants: Restaurant[];
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

export function RestaurantMap({ restaurants, onSelectRestaurant }: Props) {
  const colors = useThemeColor();

  // Filter restaurants with coordinates
  const withCoords = restaurants.filter(
    (r) => r.latitude != null && r.longitude != null,
  );

  if (withCoords.length === 0 || !MapView) return null;

  // Calculate region to fit all markers
  const lats = withCoords.map((r) => r.latitude!);
  const lngs = withCoords.map((r) => r.longitude!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const latDelta = Math.max(0.02, (maxLat - minLat) * 1.5);
  const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.5);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {withCoords.map((r) => (
          <Marker
            key={r._id}
            coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
            onPress={() => onSelectRestaurant?.(r)}
          >
            {Callout && (
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{r.name}</Text>
                  {r.nameNe && <Text style={styles.calloutNameNe}>{r.nameNe}</Text>}
                  {r.address && <Text style={styles.calloutAddr}>{r.address}</Text>}
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

/**
 * Small inline map showing a single restaurant location.
 */
export function RestaurantMiniMap({ restaurant }: { restaurant: Restaurant }) {
  const colors = useThemeColor();

  if (!restaurant.latitude || !restaurant.longitude || !MapView) return null;

  return (
    <View style={[styles.miniContainer, { borderColor: colors.border }]}>
      <MapView
        style={styles.miniMap}
        initialRegion={{
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }}
        />
      </MapView>
      <View style={[styles.miniLabel, { backgroundColor: colors.card }]}>
        <Text style={[styles.miniLabelText, { color: colors.textSecondary }]}>
          {restaurant.address ?? restaurant.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginHorizontal: 20, marginBottom: 16 },
  map: { height: 200, width: '100%' },
  callout: { padding: 8, minWidth: 120 },
  calloutName: { fontSize: 14, fontWeight: '700' },
  calloutNameNe: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  calloutAddr: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  miniContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  miniMap: { height: 120, width: '100%' },
  miniLabel: { paddingHorizontal: 12, paddingVertical: 6 },
  miniLabelText: { fontSize: 12 },
});
