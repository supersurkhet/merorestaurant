export const prerender = false;
export const ssr = true;

export const load = async ({ data }) => {
  return {
    user: data.user,
    accessToken: data.accessToken,
  };
};
