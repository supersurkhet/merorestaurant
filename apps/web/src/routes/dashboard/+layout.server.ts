import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(302, "/api/auth/login?returnTo=/dashboard");
  }
  return { user: locals.user };
};
