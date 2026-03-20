import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'mero_session';

export function getWorkOS() {
	return new WorkOS(env.WORKOS_API_KEY || '');
}

export function getClientId() {
	return env.WORKOS_CLIENT_ID || '';
}

export function getRedirectUri(origin: string) {
	return `${origin}/auth/callback`;
}

interface SessionData {
	workosUserId: string;
	email: string;
	name: string;
	accessToken: string;
}

export function setSession(cookies: Cookies, data: SessionData) {
	cookies.set(SESSION_COOKIE, JSON.stringify(data), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30 // 30 days
	});
}

export function getSession(cookies: Cookies): SessionData | null {
	const raw = cookies.get(SESSION_COOKIE);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as SessionData;
	} catch {
		return null;
	}
}

export function clearSession(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
