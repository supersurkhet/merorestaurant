import { ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';

const CONVEX_URL =
  Constants.expoConfig?.extra?.convexUrl ??
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  'https://placeholder-merorestaurant.convex.cloud';

export const convex = new ConvexReactClient(CONVEX_URL);
