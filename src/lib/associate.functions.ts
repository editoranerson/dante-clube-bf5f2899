import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { getMainSupabase } from "./main-supabase";
import { ensureAssociate, verifyMainToken } from "./associate.server";

const DANTE_TOKEN_HEADER = "x-dante-token";

/** Sends the associate's main-site session token and verifies it on the server. */
const associateAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data } = await getMainSupabase().auth.getSession();
    const token = data.session?.access_token;
    return next({ headers: token ? { [DANTE_TOKEN_HEADER]: token } : {} });
  })
  .server(async ({ next }) => {
    const token = getRequestHeader(DANTE_TOKEN_HEADER) ?? "";
    const mainUser = await verifyMainToken(token);
    if (!mainUser) throw new Error("Unauthorized: sessão de associado inválida");
    return next({ context: { mainUser } });
  });

export type ClubOffer = {
  id: string;
  title: string;
  description: string;
  discount_label: string;
  /** Shared code (single mode only). Unique-mode pools never reach the browser. */
  coupon_code: string | null;
  coupon_mode: string;
  /** The code this associate already received (unique mode). */
  my_coupon: string | null;
  /** Codes still available in the pool (unique mode). */
  coupons_left: number;
  action_type: string;
  action_url: string | null;
  address: string | null;
  cover_url: string | null;
  featured: boolean;
  category_id: string | null;
  store_name: string;
  store_logo: string | null;
};

export const getClubData = createServerFn({ method: "POST" })
  .middleware([associateAuth])
  .handler(async ({ context }) => {
    const associate = await ensureAssociate(context.mainUser);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [cats, avatars] = await Promise.all([
      supabaseAdmin.from("categories").select("id, name, icon, sort_order").order("sort_order").order("name"),
      supabaseAdmin.from("dante_avatars").select("id, name, image_url, is_default").order("sort_order").order("created_at"),
    ]);
    let offers: ClubOffer[] = [];
    if (associate.status === "ativo") {
      const res = await supabaseAdmin
        .from("offers")
        .select(
          "id, title, description, discount_label, coupon_code, coupon_mode, action_type, action_url, address, cover_url, featured, category_id, created_at, stores(name, logo_url)",
        )
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      const rows = res.data ?? [];
      const uniqueIds = rows.filter((o) => o.coupon_mode === "unique").map((o) => o.id);
      const stock = new Map<string, number>();
      const mine = new Map<string, string>();
      if (uniqueIds.length) {
        const [stockRes, mineRes] = await Promise.all([
          supabaseAdmin.rpc("coupon_stock", { _offer_ids: uniqueIds }),
          supabaseAdmin.from("offer_coupons").select("offer_id, code").eq("associate_id", associate.id).in("offer_id", uniqueIds),
        ]);
        for (const s of stockRes.data ?? []) stock.set(s.offer_id, s.available);
        for (const m of mineRes.data ?? []) mine.set(m.offer_id, m.code);
      }
      offers = rows.map((o) => {
        const store = o.stores as { name: string; logo_url: string | null } | null;
        const unique = o.coupon_mode === "unique";
        return {
          id: o.id,
          title: o.title,
          description: o.description,
          discount_label: o.discount_label,
          coupon_code: unique ? null : o.coupon_code,
          coupon_mode: unique ? "unique" : "single",
          my_coupon: unique ? (mine.get(o.id) ?? null) : null,
          coupons_left: unique ? (stock.get(o.id) ?? 0) : 0,
          action_type: o.action_type,
          action_url: o.action_url,
          address: o.address,
          cover_url: o.cover_url,
          featured: o.featured,
          category_id: o.category_id,
          store_name: store?.name ?? "",
          store_logo: store?.logo_url ?? null,
        };
      });
    }
    return { associate, categories: cats.data ?? [], avatars: avatars.data ?? [], offers };
  });

export type ClubData = Awaited<ReturnType<typeof getClubData>>;

/** Associate picks which Dante pose appears on their member card. */
export const setMyDanteAvatar = createServerFn({ method: "POST" })
  .middleware([associateAuth])
  .inputValidator((d: unknown) => z.object({ avatarId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const exists = await supabaseAdmin.from("dante_avatars").select("id").eq("id", data.avatarId).maybeSingle();
    if (!exists.data) return { ok: false as const };
    const associate = await ensureAssociate(context.mainUser);
    const upd = await supabaseAdmin.from("associates").update({ dante_avatar_id: data.avatarId }).eq("id", associate.id);
    if (upd.error) return { ok: false as const };
    return { ok: true as const, avatarId: data.avatarId };
  });

/** Hands the associate their own code from an offer's pool (one per associate, kept forever). */
export const claimCoupon = createServerFn({ method: "POST" })
  .middleware([associateAuth])
  .inputValidator((d: unknown) => z.object({ offerId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const associate = await ensureAssociate(context.mainUser);
    if (associate.status !== "ativo") return { ok: false as const, reason: "inativo" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const offer = await supabaseAdmin.from("offers").select("id, active, coupon_mode").eq("id", data.offerId).maybeSingle();
    if (!offer.data || !offer.data.active || offer.data.coupon_mode !== "unique") {
      return { ok: false as const, reason: "indisponivel" as const };
    }
    const res = await supabaseAdmin.rpc("claim_offer_coupon", { _offer_id: data.offerId, _associate_id: associate.id });
    if (res.error) throw new Error(res.error.message);
    if (!res.data) return { ok: false as const, reason: "esgotado" as const };
    return { ok: true as const, code: res.data };
  });
