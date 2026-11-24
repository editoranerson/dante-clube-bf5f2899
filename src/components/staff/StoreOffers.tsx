import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Star, Tag, Ticket, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/club/EmptyState";
import { OfferFormDialog, type Offer } from "./OfferFormDialog";
import { ConfirmDelete } from "./ConfirmDelete";
import { actionLabel } from "@/lib/format";

export const categoriesQuery = {
  queryKey: ["staff", "categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("id, name, icon, sort_order").order("sort_order").order("name");
    if (error) throw error;
    return data ?? [];
  },
};

export function StoreOffers({ storeId, canFeature, defaults }: { storeId: string; canFeature: boolean; defaults?: { website?: string | null; address?: string | null } }) {
  const queryClient = useQueryClient();
  const key = ["staff", "offers", storeId];
  const offers = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").eq("store_id", storeId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const cats = useQuery(categoriesQuery);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key });
    void queryClient.invalidateQueries({ queryKey: ["staff", "stores"] });
    void queryClient.invalidateQueries({ queryKey: ["staff", "offer-coupon-stock"] });
  };
  const catName = (id: string | null) => cats.data?.find((c) => c.id === id)?.name;

  const uniqueIds = (offers.data ?? []).filter((o) => o.coupon_mode === "unique").map((o) => o.id);
  const stock = useQuery({
    queryKey: ["staff", "offer-coupon-stock", storeId, uniqueIds],
    queryFn: async () => {
      if (!uniqueIds.length) return new Map<string, { total: number; available: number }>();
      const { data, error } = await supabase.rpc("coupon_stock", { _offer_ids: uniqueIds });
      if (error) throw error;
      const map = new Map<string, { total: number; available: number }>();
      for (const s of data ?? []) map.set(s.offer_id, { total: s.total, available: s.available });
      return map;
    },
    enabled: uniqueIds.length > 0,
  });

  async function toggleActive(o: Offer, active: boolean) {
    const { error } = await supabase.from("offers").update({ active }).eq("id", o.id);
    if (error) return toast.error("Não foi possível atualizar.");
    toast.success(active ? "Oferta ativada" : "Oferta pausada");
    refresh();
  }
  async function remove(o: Offer) {
    const { error } = await supabase.from("offers").delete().eq("id", o.id);
    if (error) return toast.error("Não foi possível excluir.");
    toast.success("Oferta excluída");
    refresh();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Ofertas e cupons</h3>
        <Button variant="hero" size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus /> Nova oferta
        </Button>
      </div>
      {offers.isLoading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div>
      ) : (offers.data ?? []).length === 0 ? (
        <EmptyState icon={<Tag />} title="Nenhuma oferta ainda" action={<Button variant="soft" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Criar primeira oferta</Button>}>
          Crie um cupom ou desconto para os Associados do Dante Clube.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {(offers.data ?? []).map((o) => (
            <li key={o.id} className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-card">
                {o.cover_url ? <img src={o.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-primary-glow"><Tag className="h-6 w-6" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {o.discount_label && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary-glow">{o.discount_label}</span>}
                  {o.featured && <span className="inline-flex items-center gap-1 rounded-full bg-tint-lilac/15 px-2 py-0.5 text-[11px] font-semibold text-tint-lilac"><Star className="h-3 w-3" /> Destaque</span>}
                  {!o.active && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Pausada</span>}
                </div>
                <p className="mt-1 truncate font-semibold">{o.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[catName(o.category_id), o.coupon_code ? `Cupom ${o.coupon_code}` : "Sem cupom", actionLabel(o.action_type)].filter(Boolean).join(" · ")}
                </p>
                {o.coupon_mode === "unique" && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary-glow">
                    <Ticket className="h-3 w-3" />
                    {(() => {
                      const s = stock.data?.get(o.id);
                      if (!s) return "Lote exclusivo";
                      return `${s.available} disponíveis de ${s.total}`;
                    })()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                <Switch checked={o.active} onCheckedChange={(v) => toggleActive(o, v)} aria-label={o.active ? "Pausar oferta" : "Ativar oferta"} />
                <div className="flex gap-1">
                  <button type="button" onClick={() => { setEditing(o); setOpen(true); }} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Editar oferta"><Pencil className="h-4 w-4" /></button>
                  <ConfirmDelete title="Excluir oferta?" description={`"${o.title}" deixará de aparecer para os Associados.`} onConfirm={() => remove(o)}>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Excluir oferta"><Trash2 className="h-4 w-4" /></button>
                  </ConfirmDelete>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <OfferFormDialog
        open={open}
        onOpenChange={setOpen}
        storeId={storeId}
        offer={editing}
        categories={cats.data ?? []}
        canFeature={canFeature}
        onSaved={refresh}
        {...(defaults ? { defaults } : {})}
      />
    </div>
  );
}
