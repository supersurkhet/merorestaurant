// Multi-tenant restaurant context — set after auth + restaurant selection

interface RestaurantInfo {
	id: string;
	name: string;
	nameNe?: string;
	slug: string;
	onboardingStatus: string;
	subscriptionTier: string;
}

let current = $state<RestaurantInfo | null>(null);

const STORAGE_KEY = 'mero_current_restaurant';

// Restore from localStorage
if (typeof window !== 'undefined') {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) current = JSON.parse(saved);
	} catch {
		// ignore
	}
}

export function getRestaurant() {
	return {
		get current() {
			return current;
		},
		get id(): string | null {
			return current?.id ?? null;
		},
		get name(): string {
			return current?.name ?? '';
		},
		get slug(): string {
			return current?.slug ?? '';
		},
		get onboardingStatus(): string {
			return current?.onboardingStatus ?? '';
		},
		get subscriptionTier(): string {
			return current?.subscriptionTier ?? 'free';
		},
		get isOperational(): boolean {
			return current?.onboardingStatus === 'operational';
		},

		set(info: RestaurantInfo) {
			current = info;
			if (typeof window !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
			}
		},

		clear() {
			current = null;
			if (typeof window !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	};
}
