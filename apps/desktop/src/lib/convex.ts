import { ConvexClient } from 'convex/browser';

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL ?? 'https://placeholder.convex.cloud';

let client: ConvexClient | null = null;

export function getConvexClient(): ConvexClient {
	if (!client) {
		client = new ConvexClient(CONVEX_URL);
	}
	return client;
}

export function closeConvexClient(): void {
	if (client) {
		client.close();
		client = null;
	}
}

// Stub helpers — replace with real Convex query/mutation calls once schema is deployed
export async function convexQuery<T>(
	_name: string,
	_args?: Record<string, unknown>
): Promise<T | null> {
	// TODO: Wire to real Convex functions
	// return await getConvexClient().query(api[name], args);
	console.warn(`[convex] query stub called: ${_name}`);
	return null;
}

export async function convexMutation(
	_name: string,
	_args?: Record<string, unknown>
): Promise<void> {
	// TODO: Wire to real Convex functions
	// await getConvexClient().mutation(api[name], args);
	console.warn(`[convex] mutation stub called: ${_name}`);
}

export type { ConvexClient };
