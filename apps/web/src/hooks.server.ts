import type { Handle } from "@sveltejs/kit";
import { SESSION_COOKIE, decodeSession } from "$lib/server/workos";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get(SESSION_COOKIE);

  if (sessionCookie) {
    const session = decodeSession(sessionCookie);
    if (session && session.expiresAt > Date.now()) {
      event.locals.user = {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
      };
      event.locals.accessToken = session.accessToken;
    } else {
      // Expired session — clear it
      event.cookies.delete(SESSION_COOKIE, { path: "/" });
    }
  }

  return resolve(event);
};
