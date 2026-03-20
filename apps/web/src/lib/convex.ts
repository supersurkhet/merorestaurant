import { ConvexClient } from 'convex/browser';

// Legacy client — prefer using convex-svelte's setupConvex/useQuery pattern instead.
// The ConvexProvider component in +layout.svelte handles client setup.
const url =
	(typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_CONVEX_URL) ||
	'https://placeholder.convex.cloud';

export const convex = new ConvexClient(url);
