import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/** Absolute origin of whatever domain is serving the site (Lovable, Vercel or a custom domain). */
export const getSiteOrigin = createIsomorphicFn()
  .server(() => getRequestUrl({ xForwardedHost: true }).origin)
  .client(() => window.location.origin);
