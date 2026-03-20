import type { RequestHandler } from "./$types";
import {
  SESSION_COOKIE,
  decodeSession,
} from "$lib/server/workos";

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionCookie = cookies.get(SESSION_COOKIE);
  if (!sessionCookie) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = decodeSession(sessionCookie);
  if (!session || session.expiresAt < Date.now()) {
    cookies.delete(SESSION_COOKIE, { path: "/" });
    return new Response(JSON.stringify({ user: null }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
      },
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
