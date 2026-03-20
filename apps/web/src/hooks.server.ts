import { redirect, type Handle } from "@sveltejs/kit";
import { SESSION_COOKIE, decodeSession } from "$lib/server/workos";

const PROTECTED_ROUTES = ["/dashboard"];

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get(SESSION_COOKIE);

  if (sessionCookie) {
    const session = await decodeSession(sessionCookie);
    if (session && session.expiresAt > Date.now()) {
      event.locals.user = {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
      };
      event.locals.accessToken = session.accessToken;
    } else {
      // Expired or tampered session — clear it
      event.cookies.delete(SESSION_COOKIE, { path: "/" });
    }
  }

  // Protect routes that require authentication
  const isProtected = PROTECTED_ROUTES.some((r) =>
    event.url.pathname.startsWith(r)
  );
  if (isProtected && !event.locals.user) {
    const returnTo = encodeURIComponent(event.url.pathname);
    redirect(302, `/api/auth/login?returnTo=${returnTo}`);
  }

  return resolve(event);
};
