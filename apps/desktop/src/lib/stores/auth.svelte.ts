// WorkOS auth state for Tauri desktop app
// Root convex roles: owner, manager, chef, waiter, cashier

type ConvexRole = 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier';

interface StaffUser {
	_id: string;
	restaurantId: string;
	workosUserId: string;
	name: string;
	email: string;
	role: ConvexRole;
	isActive: boolean;
}

interface AuthState {
	user: StaffUser | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const TOKEN_KEY = 'mero_auth_token';
const USER_KEY = 'mero_auth_user';

let authState = $state<AuthState>({
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: true
});

// Restore session on load
if (typeof window !== 'undefined') {
	try {
		const savedToken = localStorage.getItem(TOKEN_KEY);
		const savedUser = localStorage.getItem(USER_KEY);
		if (savedToken && savedUser) {
			authState = {
				user: JSON.parse(savedUser),
				token: savedToken,
				isAuthenticated: true,
				isLoading: false
			};
		} else {
			authState.isLoading = false;
		}
	} catch {
		authState.isLoading = false;
	}
}

export function getAuth() {
	return {
		get user() {
			return authState.user;
		},
		get token() {
			return authState.token;
		},
		get isAuthenticated() {
			return authState.isAuthenticated;
		},
		get isLoading() {
			return authState.isLoading;
		},
		get role(): ConvexRole | null {
			return authState.user?.role ?? null;
		},

		hasRole(...roles: ConvexRole[]) {
			return authState.user ? roles.includes(authState.user.role) : false;
		},

		// Role permissions
		get canViewKitchen() {
			return this.hasRole('owner', 'manager', 'chef', 'waiter');
		},
		get canEditKitchen() {
			return this.hasRole('owner', 'manager', 'chef');
		},
		get canViewTables() {
			return this.hasRole('owner', 'manager', 'waiter');
		},
		get canViewMenu() {
			return this.hasRole('owner', 'manager');
		},
		get canViewStaff() {
			return this.hasRole('owner', 'manager');
		},
		get canViewWifi() {
			return this.hasRole('owner', 'manager');
		},
		get canViewFonepay() {
			return this.hasRole('owner', 'manager', 'cashier');
		},
		get canViewAnalytics() {
			return this.hasRole('owner', 'manager');
		},

		login(user: StaffUser, token: string) {
			authState = { user, token, isAuthenticated: true, isLoading: false };
			if (typeof window !== 'undefined') {
				localStorage.setItem(TOKEN_KEY, token);
				localStorage.setItem(USER_KEY, JSON.stringify(user));
			}
		},

		logout() {
			authState = { user: null, token: null, isAuthenticated: false, isLoading: false };
			if (typeof window !== 'undefined') {
				localStorage.removeItem(TOKEN_KEY);
				localStorage.removeItem(USER_KEY);
			}
		},

		setLoading(loading: boolean) {
			authState.isLoading = loading;
		},

		// For dev/demo: quick login without WorkOS
		devLogin(role: ConvexRole = 'owner') {
			const devUser: StaffUser = {
				_id: 'dev-user',
				restaurantId: 'dev-restaurant',
				workosUserId: 'dev-workos-id',
				name: role === 'owner' ? 'Rajesh Sharma' : role === 'chef' ? 'Kumar Chef' : 'Staff Member',
				email: `${role}@merorestaurant.com`,
				role,
				isActive: true
			};
			this.login(devUser, 'dev-token');
		}
	};
}
