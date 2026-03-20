import { ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';

const CONVEX_URL =
  Constants.expoConfig?.extra?.convexUrl ??
  process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.warn('[Convex] EXPO_PUBLIC_CONVEX_URL not set. Set it in .env or app.json extra.');
}

// ConvexReactClient requires a non-empty URL; provide a noop fallback
// that will fail at query time with a clear error rather than crashing init.
export const convex = new ConvexReactClient(
  CONVEX_URL || 'https://not-configured.convex.cloud',
);
