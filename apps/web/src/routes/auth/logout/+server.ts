import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	clearSession(cookies);
	redirect(302, '/');
};
