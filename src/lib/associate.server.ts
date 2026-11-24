import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { MAIN_SUPABASE_ANON_KEY, MAIN_SUPABASE_URL } from "./main-supabase-config";

export type MainUser = { id: string; email: string; name: string; avatar: string | null };

/** Verifies an access token issued by the main Universo Dante site and returns its user. */
export async function verifyMainToken(token: string): Promise<MainUser | null> {
  if (!token || token.split(".").length !== 3) return null;
  const res = await fetch(`${MAIN_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: MAIN_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const u = (await res.json()) as {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  if (!u.id) return null;
  const meta = u.user_metadata ?? {};
  const pick = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string).trim() : "");
  const email = u.email ?? "";
  const name = pick("full_name") || pick("name") || pick("nome") || email.split("@")[0] || "Associado";
  const avatar = pick("avatar_url") || pick("picture") || null;
  return { id: u.id, email, name, avatar };
}

export async function ensureAssociate(user: MainUser) {
  const select = "id, member_number, full_name, email, avatar_url, dante_avatar_id, status, validation_code, created_at";
  const existing = await supabaseAdmin
    .from("associates")
    .select(select)
    .eq("main_user_id", user.id)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) {
    const patch: { full_name?: string; email?: string; avatar_url?: string } = {};
    if (!existing.data.full_name && user.name) patch.full_name = user.name;
    if (user.email && existing.data.email !== user.email) patch.email = user.email;
    if (user.avatar && existing.data.avatar_url !== user.avatar) patch.avatar_url = user.avatar;
    if (Object.keys(patch).length) {
      const upd = await supabaseAdmin.from("associates").update(patch).eq("id", existing.data.id).select(select).single();
      if (!upd.error) return upd.data;
    }
    return existing.data;
  }
  const inserted = await supabaseAdmin
    .from("associates")
    .insert({ main_user_id: user.id, full_name: user.name, email: user.email, avatar_url: user.avatar })
    .select(select)
    .single();
  if (inserted.error) {
    // Another tab created it at the same moment.
    const again = await supabaseAdmin.from("associates").select(select).eq("main_user_id", user.id).single();
    if (again.error) throw new Error(inserted.error.message);
    return again.data;
  }
  return inserted.data;
}
