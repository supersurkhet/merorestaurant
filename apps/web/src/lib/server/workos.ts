import { WorkOS } from "@workos-inc/node";
import { env } from "$env/dynamic/private";

let _workos: WorkOS | null = null;

export function getWorkOS(): WorkOS {
  if (!_workos) {
    const apiKey = env.WORKOS_API_KEY;
    if (!apiKey) throw new Error("WORKOS_API_KEY is not set");
    _workos = new WorkOS(apiKey);
  }
  return _workos;
}

export function getClientId(): string {
  const clientId = env.WORKOS_CLIENT_ID;
  if (!clientId) throw new Error("WORKOS_CLIENT_ID is not set");
  return clientId;
}

export function getRedirectUri(): string {
  return env.PUBLIC_WORKOS_REDIRECT_URI ?? "http://localhost:5173/api/auth/callback";
}

// ─── Session ───────────────────────────────────────────────────────

export const SESSION_COOKIE = "mero_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  userId: string; // WorkOS user ID
  email: string;
  firstName?: string;
  lastName?: string;
  expiresAt: number;
}

function getCookiePassword(): string {
  return env.WORKOS_COOKIE_PASSWORD ?? "dev-fallback-password-32chars!!";
}

/** HMAC-sign payload with cookie password. Format: base64(payload).base64(signature) */
export async function encodeSession(session: SessionPayload): Promise<string> {
  const payload = btoa(JSON.stringify(session));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getCookiePassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${payload}.${sigB64}`;
}

/** Verify HMAC signature and decode session. Returns null if invalid/tampered. */
export async function decodeSession(cookie: string): Promise<SessionPayload | null> {
  try {
    const dotIdx = cookie.lastIndexOf(".");
    if (dotIdx === -1) return null;

    const payload = cookie.slice(0, dotIdx);
    const sigB64 = cookie.slice(dotIdx + 1);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getCookiePassword()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;

    return JSON.parse(atob(payload)) as SessionPayload;
  } catch {
    return null;
  }
}
