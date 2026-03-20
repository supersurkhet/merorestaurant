/**
 * WorkOS AuthKit integration for React Native.
 * OAuth2 PKCE flow via expo-auth-session.
 * Tokens persisted in expo-secure-store across app restarts.
 * Automatic token refresh when access token expires.
 */
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth';

const WORKOS_CLIENT_ID = process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID;
if (!WORKOS_CLIENT_ID) {
  console.warn('[Auth] EXPO_PUBLIC_WORKOS_CLIENT_ID not set. Auth will not work.');
}

const WORKOS_BASE_URL = 'https://api.workos.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'merorestaurant' });

const discovery = {
  authorizationEndpoint: `${WORKOS_BASE_URL}/user-management/authorize`,
  tokenEndpoint: `${WORKOS_BASE_URL}/user-management/authenticate`,
};

// SecureStore keys
const KEY_ACCESS = 'workos_access_token';
const KEY_REFRESH = 'workos_refresh_token';
const KEY_EXPIRES = 'workos_token_expires_at';
const KEY_USER = 'workos_user';

WebBrowser.maybeCompleteAuthSession();

// ── helpers ──────────────────────────────────────────────

async function persistTokens(access: string, refresh: string | undefined, expiresIn: number | undefined) {
  await SecureStore.setItemAsync(KEY_ACCESS, access);
  if (refresh) {
    await SecureStore.setItemAsync(KEY_REFRESH, refresh);
  }
  const expiresAt = Date.now() + (expiresIn ?? 3600) * 1000;
  await SecureStore.setItemAsync(KEY_EXPIRES, String(expiresAt));
}

async function fetchUserProfile(accessToken: string) {
  const res = await fetch(`${WORKOS_BASE_URL}/user-management/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const d = await res.json();
  return {
    id: d.id as string,
    name: `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || 'User',
    email: d.email as string,
    phone: d.phone_number as string | undefined,
  };
}

async function clearTokens() {
  await SecureStore.deleteItemAsync(KEY_ACCESS);
  await SecureStore.deleteItemAsync(KEY_REFRESH);
  await SecureStore.deleteItemAsync(KEY_EXPIRES);
  await SecureStore.deleteItemAsync(KEY_USER);
}

// ── public API ───────────────────────────────────────────

/**
 * Initiate WorkOS login via AuthKit OAuth2 PKCE flow.
 */
export async function loginWithWorkOS(): Promise<boolean> {
  if (!WORKOS_CLIENT_ID) {
    console.error('[Auth] Cannot login — WORKOS_CLIENT_ID not configured');
    return false;
  }

  console.log('[Auth] Starting WorkOS login, redirect:', REDIRECT_URI);

  const request = new AuthSession.AuthRequest({
    clientId: WORKOS_CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    extraParams: { provider: 'authkit' },
  });

  const result = await request.promptAsync(discovery);
  console.log('[Auth] Auth result type:', result.type);

  if (result.type !== 'success' || !result.params.code) {
    return false;
  }

  try {
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: WORKOS_CLIENT_ID,
        code: result.params.code,
        redirectUri: REDIRECT_URI,
        extraParams: { code_verifier: request.codeVerifier! },
      },
      discovery,
    );

    if (!tokenResult.accessToken) return false;

    await persistTokens(
      tokenResult.accessToken,
      tokenResult.refreshToken ?? undefined,
      tokenResult.expiresIn ?? undefined,
    );

    const user = await fetchUserProfile(tokenResult.accessToken);
    if (user) {
      await SecureStore.setItemAsync(KEY_USER, JSON.stringify(user));
      useAuthStore.getState().setUser(user);
      console.log('[Auth] Login success:', user.email);
      return true;
    }
  } catch (err) {
    console.error('[Auth] Token exchange failed:', err);
  }
  return false;
}

/**
 * Refresh the access token using the stored refresh token.
 * Returns true if refresh succeeded.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync(KEY_REFRESH);
  if (!refreshToken || !WORKOS_CLIENT_ID) {
    console.log('[Auth] No refresh token available');
    return false;
  }

  console.log('[Auth] Refreshing access token...');

  try {
    const tokenResult = await AuthSession.refreshAsync(
      {
        clientId: WORKOS_CLIENT_ID,
        refreshToken,
      },
      discovery,
    );

    if (!tokenResult.accessToken) return false;

    await persistTokens(
      tokenResult.accessToken,
      tokenResult.refreshToken ?? refreshToken, // keep old refresh if not rotated
      tokenResult.expiresIn ?? undefined,
    );

    // Re-fetch user profile with new token
    const user = await fetchUserProfile(tokenResult.accessToken);
    if (user) {
      await SecureStore.setItemAsync(KEY_USER, JSON.stringify(user));
      useAuthStore.getState().setUser(user);
      console.log('[Auth] Token refreshed for:', user.email);
      return true;
    }
  } catch (err) {
    console.error('[Auth] Token refresh failed:', err);
  }
  return false;
}

/**
 * Restore session on app start.
 * Checks token expiry and refreshes if needed.
 */
export async function restoreSession(): Promise<void> {
  try {
    const accessToken = await SecureStore.getItemAsync(KEY_ACCESS);
    const userJson = await SecureStore.getItemAsync(KEY_USER);
    const expiresAtStr = await SecureStore.getItemAsync(KEY_EXPIRES);

    if (!accessToken || !userJson) {
      useAuthStore.getState().setUser(null);
      return;
    }

    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0;
    const isExpired = Date.now() > expiresAt - 60_000; // 1 min buffer

    if (isExpired) {
      console.log('[Auth] Token expired, attempting refresh...');
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        // Refresh failed — clear everything, user must re-login
        await clearTokens();
        useAuthStore.getState().setUser(null);
        console.log('[Auth] Refresh failed, session cleared');
        return;
      }
    } else {
      // Token still valid — restore from SecureStore
      const user = JSON.parse(userJson);
      useAuthStore.getState().setUser(user);
      console.log('[Auth] Session restored:', user.email, '(expires in', Math.round((expiresAt - Date.now()) / 60_000), 'min)');
    }
  } catch (err) {
    console.error('[Auth] Restore session error:', err);
    useAuthStore.getState().setUser(null);
  }
}

/**
 * Get current access token (refreshing if expired).
 * Useful for authenticated API calls.
 */
export async function getAccessToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(KEY_ACCESS);
  const expiresAtStr = await SecureStore.getItemAsync(KEY_EXPIRES);
  const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0;

  if (!token) return null;

  if (Date.now() > expiresAt - 60_000) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
    return SecureStore.getItemAsync(KEY_ACCESS);
  }

  return token;
}

/**
 * Log out — clear all tokens and user data.
 */
export async function logout(): Promise<void> {
  await clearTokens();
  useAuthStore.getState().logout();
  console.log('[Auth] Logged out');
}
