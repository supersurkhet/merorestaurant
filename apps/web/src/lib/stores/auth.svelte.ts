/** Client-side auth state. Populated from server layout data. */

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

let user = $state<User | null>(null);

export function getAuth() {
  return {
    get user() {
      return user;
    },
    get isAuthenticated() {
      return user !== null;
    },
    get displayName() {
      if (!user) return "";
      if (user.firstName) return `${user.firstName} ${user.lastName ?? ""}`.trim();
      return user.email;
    },
    setUser(u: User | null) {
      user = u;
    },
    login(returnTo?: string) {
      const url = returnTo
        ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
        : "/api/auth/login";
      window.location.href = url;
    },
    logout() {
      window.location.href = "/api/auth/logout";
    },
  };
}
