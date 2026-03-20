import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getWorkOS, getClientId, getRedirectUri } from "$lib/server/workos";

export const GET: RequestHandler = async ({ url }) => {
  const workos = getWorkOS();
  const clientId = getClientId();
  const redirectUri = getRedirectUri(url.origin);

  // Optional: pass a return URL to redirect after login
  const returnTo = url.searchParams.get("returnTo") ?? "/dashboard";

  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId,
    redirectUri,
    state: btoa(JSON.stringify({ returnTo })),
  });

  redirect(302, authorizationUrl);
};
