import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getWorkOS, getClientId, getRedirectUri } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url }) => {
	const workos = getWorkOS();
	const clientId = getClientId();
	const redirectUri = getRedirectUri(url.origin);

	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		provider: 'authkit',
		clientId,
		redirectUri
	});

	redirect(302, authorizationUrl);
};
