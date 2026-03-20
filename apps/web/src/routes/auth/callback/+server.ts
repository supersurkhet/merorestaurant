import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getWorkOS, getClientId, setSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	if (!code) {
		redirect(302, '/register?error=no_code');
	}

	const workos = getWorkOS();
	const clientId = getClientId();

	try {
		const { user, accessToken } = await workos.userManagement.authenticateWithCode({
			code,
			clientId
		});

		setSession(cookies, {
			workosUserId: user.id,
			email: user.email,
			name: user.firstName
				? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
				: user.email,
			accessToken
		});

		// Check if they need to onboard (redirect to register step 2) or go to dashboard
		redirect(302, '/register?step=restaurant');
	} catch (err: any) {
		console.error('WorkOS auth error:', err);
		redirect(302, '/register?error=auth_failed');
	}
};
