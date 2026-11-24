import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "./brand";

/** Creates the default ADMIN account once, if the club has no admin yet. Idempotent. */
export const ensureDefaultAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if ((count ?? 0) > 0) return { created: false };

  let userId: string | undefined;
  const created = await supabaseAdmin.auth.admin.createUser({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Administrador Dante Clube" },
  });
  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = list.data.users.find((u) => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL)?.id;
  }
  if (!userId) return { created: false };
  await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  return { created: true };
});

const partnerSchema = z.object({
  storeId: z.string().uuid(),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

/** ADMIN creates a login for a store's partner and links it to the store. */
export const createPartnerAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => partnerSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Apenas a gestão pode criar acessos de parceiro.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();
    let userId: string | undefined;
    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (created.data.user) userId = created.data.user.id;
    else {
      const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list.data.users.find((u) => u.email?.toLowerCase() === email);
      if (!found) return { ok: false as const, error: "Não foi possível criar o acesso. Verifique o e-mail." };
      userId = found.id;
      await supabaseAdmin.auth.admin.updateUserById(found.id, { password: data.password });
    }
    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "partner" }, { onConflict: "user_id,role" });
    const upd = await supabaseAdmin
      .from("stores")
      .update({ owner_id: userId, owner_email: email })
      .eq("id", data.storeId);
    if (upd.error) return { ok: false as const, error: "Acesso criado, mas não foi possível vincular à loja." };
    return { ok: true as const };
  });
