import { ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';

const CONVEX_URL =
  Constants.expoConfig?.extra?.convexUrl ??
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  '';

if (!CONVEX_URL) {
  console.warn('[Convex] No CONVEX_URL configured. Set EXPO_PUBLIC_CONVEX_URL in .env');
}

export const convex = new ConvexReactClient(CONVEX_URL || 'https://unconfigured.convex.cloud');
