import { WorkOS } from "@workos-inc/node";
import { env } from "$env/dynamic/private";

let _workos: WorkOS | null = null;

export function getWorkOS(): WorkOS {
  if (!_workos) {
    const apiKey = env.WORKOS_API_KEY;
    if (!apiKey) {
      throw new Error("WORKOS_API_KEY is not set");
    }
    _workos = new WorkOS(apiKey);
  }
  return _workos;
}

export function getClientId(): string {
  const clientId = env.WORKOS_CLIENT_ID;
  if (!clientId) {
    throw new Error("WORKOS_CLIENT_ID is not set");
  }
  return clientId;
}

export function getRedirectUri(): string {
  return (
    env.PUBLIC_WORKOS_REDIRECT_URI ?? "http://localhost:5173/api/auth/callback"
  );
}

// Session cookie config
export const SESSION_COOKIE = "mero_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  expiresAt: number;
}

/** Encode session to a cookie-safe base64 string. */
export function encodeSession(session: SessionPayload): string {
  return btoa(JSON.stringify(session));
}

/** Decode session from cookie. Returns null if invalid. */
export function decodeSession(cookie: string): SessionPayload | null {
  try {
    return JSON.parse(atob(cookie));
  } catch {
    return null;
  }
}
