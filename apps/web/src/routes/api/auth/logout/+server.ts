import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { SESSION_COOKIE } from "$lib/server/workos";

export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  redirect(302, "/");
};

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
