import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  getWorkOS,
  getClientId,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  encodeSession,
  type SessionPayload,
} from "$lib/server/workos";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");

  if (!code) {
    redirect(302, "/api/auth/login");
  }

  let returnTo = "/dashboard";
  if (stateParam) {
    try {
      const state = JSON.parse(atob(stateParam));
      returnTo = state.returnTo ?? "/dashboard";
    } catch {
      // ignore bad state
    }
  }

  const workos = getWorkOS();
  const clientId = getClientId();

  try {
    const authResponse =
      await workos.userManagement.authenticateWithCode({
        code,
        clientId,
      });

    const { user, accessToken, refreshToken } = authResponse;

    const session: SessionPayload = {
      accessToken,
      refreshToken: refreshToken ?? "",
      userId: user.id,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    };

    cookies.set(SESSION_COOKIE, encodeSession(session), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    });

    redirect(302, returnTo);
  } catch (error) {
    console.error("WorkOS auth callback error:", error);
    redirect(302, "/?error=auth_failed");
  }
};
