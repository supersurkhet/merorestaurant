// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				firstName?: string;
				lastName?: string;
			};
			accessToken?: string;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				WORKOS_API_KEY?: string;
				WORKOS_CLIENT_ID?: string;
				PUBLIC_WORKOS_REDIRECT_URI?: string;
			};
		}
	}
}

export {};
