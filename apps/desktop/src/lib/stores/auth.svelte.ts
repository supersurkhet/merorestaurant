// Authentication store for Tauri desktop app
// Root convex roles: owner, manager, chef, waiter, cashier

type ConvexRole = 'owner' | 'manager' | 'chef' | 'waiter' | 'cashier';

export interface PlatformUser {
	_id: string;
	workosUserId: string;
	email: string;
	name: string;
	phone?: string;
	avatarUrl?: string;
}

export interface OwnedRestaurant {
	_id: string;
	name: string;
	nameNe?: string;
	slug: string;
	onboardingStatus: string;
	subscriptionTier: string;
	isActive: boolean;
}

export interface StaffRole {
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
	accessToken: string | null;
}

const AUTH_KEY = 'mero_auth_state';
const PKCE_KEY = 'mero_pkce_verifier';

let authState = $state<AuthState>({
	user: null,
	ownedRestaurants: [],
	roles: [],
	isAuthenticated: false,
	isLoading: true,
	accessToken: null
});

// Restore session from localStorage
if (typeof window !== 'undefined') {
	try {
		const saved = localStorage.getItem(AUTH_KEY);
		if (saved) {
			const parsed = JSON.parse(saved);
			authState = { ...parsed, isLoading: false };
		} else {
			authState = { ...authState, isLoading: false };
		}
	} catch {
		authState = { ...authState, isLoading: false };
	}
}

// --- PKCE helpers ---
function generateCodeVerifier(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
	let str = '';
	for (const byte of buffer) {
		str += String.fromCharCode(byte);
	}
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getAuth() {
	return {
		get user() { return authState.user; },
		get isAuthenticated() { return authState.isAuthenticated; },
		get isLoading() { return authState.isLoading; },
		get ownedRestaurants() { return authState.ownedRestaurants; },
		get roles() { return authState.roles; },
		get accessToken() { return authState.accessToken; },

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

		roleFor(restaurantId: string): ConvexRole | null {
			if (authState.ownedRestaurants.some((r) => r._id === restaurantId)) {
				return 'owner';
			}
			const staffRole = authState.roles.find((r) => r.restaurantId === restaurantId);
			return (staffRole?.role as ConvexRole) ?? null;
		},

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

		// --- WorkOS PKCE OAuth flow ---

		async startOAuthFlow(clientId: string, redirectUri: string): Promise<string> {
			const codeVerifier = generateCodeVerifier();
			const codeChallenge = await generateCodeChallenge(codeVerifier);

			// Store verifier for callback
			if (typeof window !== 'undefined') {
				localStorage.setItem(PKCE_KEY, codeVerifier);
			}

			const params = new URLSearchParams({
				client_id: clientId,
				redirect_uri: redirectUri,
				response_type: 'code',
				code_challenge: codeChallenge,
				code_challenge_method: 'S256',
				provider: 'authkit'
			});

			return `https://api.workos.com/user_management/authorize?${params.toString()}`;
		},

		getStoredCodeVerifier(): string | null {
			if (typeof window === 'undefined') return null;
			return localStorage.getItem(PKCE_KEY);
		},

		clearCodeVerifier() {
			if (typeof window !== 'undefined') {
				localStorage.removeItem(PKCE_KEY);
			}
		},

		// Exchange authorization code for user profile via WorkOS API (PKCE — no secret needed)
		async exchangeCodeForUser(
			code: string,
			clientId: string,
			codeVerifier: string
		): Promise<{ workosUserId: string; email: string; name: string } | null> {
			const response = await fetch('https://api.workos.com/user_management/authenticate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					grant_type: 'authorization_code',
					client_id: clientId,
					code,
					code_verifier: codeVerifier
				})
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(`WorkOS auth failed: ${response.status} ${err}`);
			}

			const data = await response.json();
			// WorkOS returns { user: { id, email, first_name, last_name, ... }, access_token, ... }
			const user = data.user;
			if (!user) throw new Error('No user in WorkOS response');

			// Store access token
			authState.accessToken = data.access_token ?? null;

			return {
				workosUserId: user.id,
				email: user.email,
				name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
			};
		},

		// Login with data from Convex auth.currentUser response
		loginWithConvexData(data: {
			user: PlatformUser;
			ownedRestaurants: OwnedRestaurant[];
			roles: StaffRole[];
		}) {
			authState = {
				user: data.user,
				ownedRestaurants: data.ownedRestaurants,
				roles: data.roles,
				isAuthenticated: true,
				isLoading: false,
				accessToken: authState.accessToken
			};
			this.persist();
		},

		persist() {
			if (typeof window !== 'undefined') {
				localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
			}
		},

		logout() {
			authState = {
				user: null,
				ownedRestaurants: [],
				roles: [],
				isAuthenticated: false,
				isLoading: false,
				accessToken: null
			};
			if (typeof window !== 'undefined') {
				localStorage.removeItem(AUTH_KEY);
				localStorage.removeItem(PKCE_KEY);
			}
		},

		setLoading(loading: boolean) {
			authState.isLoading = loading;
		}
	};
}
