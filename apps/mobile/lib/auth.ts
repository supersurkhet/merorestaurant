/**
 * WorkOS AuthKit integration for React Native.
 *
 * Uses OAuth2 PKCE flow via expo-auth-session to authenticate with WorkOS.
 * After authentication, stores the user session in the auth store.
 */
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth';

const WORKOS_CLIENT_ID = process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID ?? 'client_01KKYG4JJK79BPD8C3QHRPKVS9';
const WORKOS_BASE_URL = 'https://api.workos.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'merorestaurant' });

// Token storage keys
const ACCESS_TOKEN_KEY = 'workos_access_token';
const REFRESH_TOKEN_KEY = 'workos_refresh_token';
const USER_KEY = 'workos_user';

WebBrowser.maybeCompleteAuthSession();

/**
 * Initiate WorkOS login via AuthKit OAuth2 PKCE flow.
 */
export async function loginWithWorkOS(): Promise<boolean> {
  console.log('[Auth] Starting WorkOS login, redirect:', REDIRECT_URI);

  const discovery = {
    authorizationEndpoint: `${WORKOS_BASE_URL}/user-management/authorize`,
    tokenEndpoint: `${WORKOS_BASE_URL}/user-management/authenticate`,
  };

  const request = new AuthSession.AuthRequest({
    clientId: WORKOS_CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    extraParams: {
      provider: 'authkit',
    },
  });

  const result = await request.promptAsync(discovery);
  console.log('[Auth] Auth result type:', result.type);

  if (result.type !== 'success' || !result.params.code) {
    console.log('[Auth] Login cancelled or failed');
    return false;
  }

  // Exchange code for tokens
  try {
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: WORKOS_CLIENT_ID,
        code: result.params.code,
        redirectUri: REDIRECT_URI,
        extraParams: {
          code_verifier: request.codeVerifier!,
        },
      },
      discovery,
    );

    if (tokenResult.accessToken) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenResult.accessToken);
      if (tokenResult.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenResult.refreshToken);
      }

      // Fetch user profile
      const userResponse = await fetch(`${WORKOS_BASE_URL}/user-management/users/me`, {
        headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const user = {
          id: userData.id,
          name: `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim() || 'User',
          email: userData.email,
          phone: userData.phone_number,
        };

        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        useAuthStore.getState().setUser(user);
        console.log('[Auth] Login success:', user.email);
        return true;
      }
    }
  } catch (err) {
    console.error('[Auth] Token exchange failed:', err);
  }

  return false;
}

/**
 * Restore saved session on app start.
 */
export async function restoreSession(): Promise<void> {
  try {
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (userJson && token) {
      const user = JSON.parse(userJson);
      useAuthStore.getState().setUser(user);
      console.log('[Auth] Session restored:', user.email);
    } else {
      useAuthStore.getState().setUser(null);
    }
  } catch {
    useAuthStore.getState().setUser(null);
  }
}

/**
 * Log out — clear tokens and user data.
 */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  useAuthStore.getState().logout();
  console.log('[Auth] Logged out');
}
