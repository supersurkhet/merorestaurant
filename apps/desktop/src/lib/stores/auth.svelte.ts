import type { Role, Staff } from '$lib/types';

interface AuthState {
	user: Staff | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

let authState = $state<AuthState>({
	user: null,
	isAuthenticated: false,
	isLoading: true
});

export function getAuth() {
	return {
		get user() {
			return authState.user;
		},
		get isAuthenticated() {
			return authState.isAuthenticated;
		},
		get isLoading() {
			return authState.isLoading;
		},
		get role(): Role | null {
			return authState.user?.role ?? null;
		},
		hasRole(...roles: Role[]) {
			return authState.user ? roles.includes(authState.user.role) : false;
		},
		login(user: Staff) {
			authState = { user, isAuthenticated: true, isLoading: false };
		},
		logout() {
			authState = { user: null, isAuthenticated: false, isLoading: false };
		},
		setLoading(loading: boolean) {
			authState.isLoading = loading;
		}
	};
}
