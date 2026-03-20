// Multi-tenant auth state for Tauri desktop app
// Root convex roles: owner, manager, chef, waiter, cashier

type ConvexRole = 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier';

interface PlatformUser {
	_id: string;
	workosUserId: string;
	email: string;
	name: string;
	phone?: string;
	avatarUrl?: string;
}

interface OwnedRestaurant {
	_id: string;
	name: string;
	nameNe?: string;
	slug: string;
	onboardingStatus: string;
	subscriptionTier: string;
	isActive: boolean;
}

interface StaffRole {
	restaurantId: string;
	role: ConvexRole;
	restaurant?: OwnedRestaurant;
}

interface AuthState {
	user: PlatformUser | null;
	ownedRestaurants: OwnedRestaurant[];
	roles: StaffRole[];
	isAuthenticated: boolean;
	isLoading: boolean;
}

const TOKEN_KEY = 'mero_auth_token';
const USER_KEY = 'mero_auth_state';

let authState = $state<AuthState>({
	user: null,
	ownedRestaurants: [],
	roles: [],
	isAuthenticated: false,
	isLoading: true
});

// Restore session
if (typeof window !== 'undefined') {
	try {
		const saved = localStorage.getItem(USER_KEY);
		if (saved) {
			const parsed = JSON.parse(saved);
			authState = { ...parsed, isLoading: false };
		} else {
			authState.isLoading = false;
		}
	} catch {
		authState.isLoading = false;
	}
}

export function getAuth() {
	return {
		get user() { return authState.user; },
		get isAuthenticated() { return authState.isAuthenticated; },
		get isLoading() { return authState.isLoading; },
		get ownedRestaurants() { return authState.ownedRestaurants; },
		get roles() { return authState.roles; },

		// All restaurants this user can access (owned + staff roles)
		get allRestaurants(): OwnedRestaurant[] {
			const all = new Map<string, OwnedRestaurant>();
			for (const r of authState.ownedRestaurants) {
				all.set(r._id, r);
			}
			for (const role of authState.roles) {
				if (role.restaurant && !all.has(role.restaurantId)) {
					all.set(role.restaurantId, role.restaurant as OwnedRestaurant);
				}
			}
			return [...all.values()];
		},

		get hasRestaurants(): boolean {
			return this.allRestaurants.length > 0;
		},

		// Get role for a specific restaurant
		roleFor(restaurantId: string): ConvexRole | null {
			// Owner gets 'owner' role
			if (authState.ownedRestaurants.some((r) => r._id === restaurantId)) {
				return 'owner';
			}
			const staffRole = authState.roles.find((r) => r.restaurantId === restaurantId);
			return (staffRole?.role as ConvexRole) ?? null;
		},

		get role(): ConvexRole | null {
			return null; // Use roleFor(restaurantId) instead
		},

		hasRole(...roles: ConvexRole[]) {
			return false; // Deprecated — use roleFor
		},

		// Permission checks (need restaurantId)
		canView(restaurantId: string, page: string): boolean {
			const role = this.roleFor(restaurantId);
			if (!role) return false;
			if (role === 'owner' || role === 'manager') return true;
			const allowed: Record<string, string[]> = {
				chef: ['dashboard', 'kitchen'],
				waiter: ['dashboard', 'kitchen', 'tables'],
				cashier: ['dashboard', 'fonepay']
			};
			return (allowed[role] ?? []).includes(page);
		},

		canEditKitchen(restaurantId: string): boolean {
			const role = this.roleFor(restaurantId);
			return role === 'owner' || role === 'manager' || role === 'chef';
		},

		// Login with Convex auth response
		loginWithConvexData(data: { user: PlatformUser; ownedRestaurants: OwnedRestaurant[]; roles: StaffRole[] }) {
			authState = {
				user: data.user,
				ownedRestaurants: data.ownedRestaurants,
				roles: data.roles,
				isAuthenticated: true,
				isLoading: false
			};
			if (typeof window !== 'undefined') {
				localStorage.setItem(USER_KEY, JSON.stringify(authState));
			}
		},

		// Dev login
		devLogin(role: ConvexRole = 'owner') {
			const devUser: PlatformUser = {
				_id: 'dev-user-id',
				workosUserId: 'dev-workos-id',
				email: `${role}@merorestaurant.com`,
				name: role === 'owner' ? 'Rajesh Sharma' : 'Staff Member'
			};
			const devRestaurant: OwnedRestaurant = {
				_id: 'dev-restaurant-id',
				name: 'Mero Restaurant',
				nameNe: 'मेरो रेस्टुरेन्ट',
				slug: 'mero-restaurant',
				onboardingStatus: 'operational',
				subscriptionTier: 'free',
				isActive: true
			};
			this.loginWithConvexData({
				user: devUser,
				ownedRestaurants: role === 'owner' ? [devRestaurant] : [],
				roles: role !== 'owner' ? [{ restaurantId: devRestaurant._id, role, restaurant: devRestaurant }] : []
			});
		},

		logout() {
			authState = { user: null, ownedRestaurants: [], roles: [], isAuthenticated: false, isLoading: false };
			if (typeof window !== 'undefined') {
				localStorage.removeItem(USER_KEY);
				localStorage.removeItem(TOKEN_KEY);
			}
		},

		setLoading(loading: boolean) {
			authState.isLoading = loading;
		}
	};
}
