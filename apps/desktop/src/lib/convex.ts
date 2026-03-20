import { setupConvex, useConvexClient, useQuery } from 'convex-svelte';
export { setupConvex, useConvexClient, useQuery };
export { api } from '../../convex/_generated/api';

export const CONVEX_URL = import.meta.env.VITE_CONVEX_URL ?? 'https://placeholder.convex.cloud';
