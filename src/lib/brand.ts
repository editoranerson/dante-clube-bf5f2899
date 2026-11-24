// Brand images are served by the site itself (public/brand), so they work on any host
// (Vercel included) and the browser caches them without touching the club database.
export const DANTE_AVATAR_URL = "/brand/dante-avatar.webp";
export const UNIVERSO_LOGO_URL = "/brand/universo-dante-logo.webp";
export const OG_HOME_IMAGE_PATH = "/og-home.png";
export const DEFAULT_UNIVERSO_URL = "https://queridodante.site";
export const DEFAULT_ADMIN_EMAIL = "admin@danteclube.com";
export const DEFAULT_ADMIN_PASSWORD = "DanteClube#2026";
export const MEMBER_NUMBER_START = 100;

export type DanteAvatarOption = { id: string; name: string; image_url: string; is_default: boolean };

/** Foto da carteirinha: a pose escolhida pelo Associado, senão a pose padrão do ADMIN, senão o Dante oficial. */
export function resolveDanteAvatar(avatars: DanteAvatarOption[], chosenId: string | null | undefined): string {
  const chosen = chosenId ? avatars.find((a) => a.id === chosenId) : undefined;
  if (chosen) return chosen.image_url;
  return avatars.find((a) => a.is_default)?.image_url ?? avatars[0]?.image_url ?? DANTE_AVATAR_URL;
}
