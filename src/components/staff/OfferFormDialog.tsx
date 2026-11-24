import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Ticket } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";
import { actionLabel } from "@/lib/format";
import { parseCouponCodes } from "@/lib/coupons";
import type { CouponMode } from "@/lib/coupons";

export type Offer = Tables<"offers">;
type Category = Pick<Tables<"categories">, "id" | "name">;

const schema = z.object({
  title: z.string().trim().min(2, "Dê um título para a oferta").max(120),
  description: z.string().trim().max(500),
  discount_label: z.string().trim().max(30),
  coupon_code: z.string().trim().max(40),
  action_url: z.string().trim().max(500).refine((v) => !v || /^https?:\/\//i.test(v), "O link precisa começar com https://"),
  address: z.string().trim().max(250),
});

export function OfferFormDialog({
  open,
  onOpenChange,
  storeId,
  offer,
  categories,
  canFeature,
  defaults,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  storeId: string;
  offer: Offer | null;
  categories: Category[];
  canFeature: boolean;
  defaults?: { website?: string | null; address?: string | null };
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [coupon, setCoupon] = useState("");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [actionType, setActionType] = useState("loja");
  const [actionUrl, setActionUrl] = useState("");
  const [address, setAddress] = useState("");
  const [couponMode, setCouponMode] = useState<CouponMode>("single");
  const [couponBatch, setCouponBatch] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offerId = offer?.id;
  const couponStock = useQuery({
    queryKey: ["staff", "offer-coupon-stock", offerId],
    queryFn: async () => {
      if (!offerId) return { total: 0, available: 0 };
      const { data, error } = await supabase.rpc("coupon_stock", { _offer_ids: [offerId] });
      if (error) throw error;
      const row = (data ?? [])[0];
      return { total: row?.total ?? 0, available: row?.available ?? 0 };
    },
    enabled: !!offerId && offer?.coupon_mode === "unique",
  });

  useEffect(() => {
    if (!open) return;
    setTitle(offer?.title ?? "");
    setDescription(offer?.description ?? "");
    setDiscount(offer?.discount_label ?? "");
    setCoupon(offer?.coupon_code ?? "");
    setCouponMode((offer?.coupon_mode === "unique" ? "unique" : "single") as CouponMode);
    setCouponBatch("");
    setCategoryId(offer?.category_id ?? categories[0]?.id ?? "none");
    setActionType(offer?.action_type ?? "loja");
    setActionUrl(offer?.action_url ?? defaults?.website ?? "");
    setAddress(offer?.address ?? defaults?.address ?? "");
    setCover(offer?.cover_url ?? null);
    setFeatured(offer?.featured ?? false);
    setActive(offer?.active ?? true);
    setError(null);
  }, [open, offer, categories, defaults?.website, defaults?.address]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ title, description, discount_label: discount, coupon_code: coupon, action_url: actionUrl, address });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Verifique os campos.");
    const d = parsed.data;
    if (actionType === "endereco" && !d.address) return setError("Informe o endereço do benefício presencial.");
    if (actionType !== "endereco" && !d.action_url) return setError("Informe o link da oferta.");

    const batchCodes = couponMode === "unique" ? parseCouponCodes(couponBatch) : [];
    if (couponMode === "unique" && !offer && batchCodes.length === 0) {
      return setError("Cole ao menos um código para o lote de cupons exclusivos.");
    }

    const row = {
      store_id: storeId,
      title: d.title,
      description: d.description,
      discount_label: d.discount_label,
      coupon_code: couponMode === "single" ? (d.coupon_code ? d.coupon_code.toUpperCase() : null) : null,
      coupon_mode: couponMode,
      category_id: categoryId === "none" ? null : categoryId,
      action_type: actionType,
      action_url: d.action_url || null,
      address: d.address || null,
      cover_url: cover,
      active,
      ...(canFeature ? { featured } : {}),
    };
    setBusy(true);
    let savedId = offer?.id;
    if (offer) {
      const res = await supabase.from("offers").update(row).eq("id", offer.id);
      if (res.error) { setBusy(false); return setError("Não foi possível salvar a oferta. Tente novamente."); }
    } else {
      const res = await supabase.from("offers").insert(row).select("id").single();
      if (res.error || !res.data) { setBusy(false); return setError("Não foi possível salvar a oferta. Tente novamente."); }
      savedId = res.data.id;
    }

    if (couponMode === "unique" && batchCodes.length && savedId) {
      const rows = batchCodes.map((code) => ({ offer_id: savedId!, code }));
      const ins = await supabase.from("offer_coupons").insert(rows);
      if (ins.error) {
        setBusy(false);
        toast.success(offer ? "Oferta atualizada!" : "Oferta criada!", { description: "Alguns códigos do lote podem já existir e foram ignorados." });
        onSaved();
        onOpenChange(false);
        return;
      }
      toast.success(`${batchCodes.length} cupom${batchCodes.length > 1 ? "s" : ""} adicionado${batchCodes.length > 1 ? "s" : ""} ao lote!`);
    }

    setBusy(false);
    toast.success(offer ? "Oferta atualizada!" : "Oferta criada!");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle className="font-display text-xl">{offer ? "Editar oferta" : "Nova oferta"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="of-title">Título</Label>
            <Input id="of-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: 20% em toda a loja" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="of-discount">Tag de desconto</Label>
              <Input id="of-discount" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Ex: 20% OFF" />
            </div>
            <div className="space-y-2">
              <Label>Modalidade de cupom</Label>
              <Select value={couponMode} onValueChange={(v) => setCouponMode(v as CouponMode)}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Cupom compartilhado</SelectItem>
                  <SelectItem value="unique">Lote exclusivo (1 por associado)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {couponMode === "single" ? (
            <div className="space-y-2">
              <Label htmlFor="of-coupon">Cupom (opcional)</Label>
              <Input id="of-coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Ex: DANTE20" className="uppercase" />
              <p className="text-xs text-muted-foreground">Um código compartilhado entre todos os Associados.</p>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="of-batch" className="flex items-center gap-2"><Ticket className="h-4 w-4 text-primary-glow" /> Lote de cupons exclusivos</Label>
                {offer && couponStock.data && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {couponStock.data.available} disponíveis de {couponStock.data.total}
                  </span>
                )}
              </div>
              <Textarea
                id="of-batch"
                value={couponBatch}
                onChange={(e) => setCouponBatch(e.target.value)}
                placeholder={"Cole um código por linha\nEx:\nDANTE001\nDANTE002\nDANTE003"}
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {couponBatch.trim() ? `${parseCouponCodes(couponBatch).length} código(s) válido(s) detectados.` : "Um por linha. Códigos repetidos ou já cadastrados são ignorados."}
                {offer && " Adicione novos códigos ao lote existente a qualquer momento."}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="of-desc">Descrição</Label>
            <Textarea id="of-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Regras, validade e como usar" rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  <SelectItem value="none">Sem categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Botão de ação</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["google_play", "loja", "endereco"].map((t) => <SelectItem key={t} value={t}>{actionLabel(t)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {actionType === "endereco" ? (
            <div className="space-y-2">
              <Label htmlFor="of-address">Endereço</Label>
              <Input id="of-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="of-url">{actionType === "google_play" ? "Link na Google Play" : "Link da loja"}</Label>
              <Input id="of-url" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="https://" inputMode="url" />
            </div>
          )}
          <ImageUpload label="Capa (opcional)" value={cover} onChange={setCover} folder="offers" />
          <div className="space-y-3 rounded-2xl bg-background/50 p-4">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span><span className="font-medium">Oferta ativa</span><span className="block text-xs text-muted-foreground">Associados veem esta oferta</span></span>
              <Switch checked={active} onCheckedChange={setActive} />
            </label>
            {canFeature && (
              <label className="flex items-center justify-between gap-3 text-sm">
                <span><span className="font-medium">Destaque da semana</span><span className="block text-xs text-muted-foreground">Aparece no carrossel do Início</span></span>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </label>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Salvar oferta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
