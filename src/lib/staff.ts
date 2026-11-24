import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "partner";

export async function getMyStaffRoles(): Promise<{ userId: string; email: string; roles: StaffRole[] } | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
  return { userId: u.user.id, email: u.user.email ?? "", roles: (data ?? []).map((r) => r.role as StaffRole) };
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads an image to the club's media storage and returns a long-lived link to it. */
export async function uploadClubImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Envie um arquivo de imagem.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter até 5 MB.");
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("club-media").upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (up.error) throw new Error("Não foi possível enviar a imagem.");
  const signed = await supabase.storage.from("club-media").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw new Error("Não foi possível gerar o link da imagem.");
  return signed.data.signedUrl;
}
