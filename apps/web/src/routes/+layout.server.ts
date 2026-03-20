import type { LayoutServerLoad } from "./$types";
import { getSession } from "$lib/server/auth";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const session = getSession(cookies);
  return {
    user: session
      ? {
          workosUserId: session.workosUserId,
          email: session.email,
          name: session.name,
        }
      : null,
  };
};
