import type { LayoutServerLoad } from "./$types";

// Auth is enforced by hooks.server.ts — if we get here, user is authenticated
export const load: LayoutServerLoad = async ({ locals }) => {
  return { user: locals.user! };
};
