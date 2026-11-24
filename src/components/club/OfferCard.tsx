import { forwardRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, ExternalLink, Gift, Loader2, MapPin, Store, TicketX } from "lucide-react";
import { claimCoupon, type ClubData, type ClubOffer } from "@/lib/associate.functions";
import { associateCouponState } from "@/lib/coupons";
import { OfferVisual } from "./OfferVisual";
import { Button } from "@/components/ui/button";
import { actionHref, actionLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export const OfferCard = forwardRef<
  HTMLElement,
  { offer: ClubOffer; categoryName?: string; categoryIcon?: string; highlighted?: boolean }
>(function OfferCard({ offer, categoryName, categoryIcon, highlighted }, ref) {
  const href = actionHref(offer);
  const ActionIcon = offer.action_type === "endereco" ? MapPin : offer.action_type === "loja" ? Store : ExternalLink;
  return (
    <article
      ref={ref}
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-colors",
        highlighted && "animate-highlight border-primary-glow",
      )}
    >
      <div className="relative h-36">
        <OfferVisual cover={offer.cover_url} logo={offer.store_logo} icon={categoryIcon} alt={offer.store_name} />
        {offer.discount_label && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-primary px-3 py-1 font-friendly text-sm font-semibold text-primary-foreground shadow-glow">
            {offer.discount_label}
          </span>
        )}
        {categoryName && (
          <span className="absolute right-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
            {categoryName}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          {offer.store_logo && offer.cover_url && (
            <img src={offer.store_logo} alt="" className="h-6 w-6 rounded-full object-cover" loading="lazy" />
          )}
          <p className="text-xs font-semibold text-muted-foreground">{offer.store_name}</p>
        </div>
        <h3 className="mt-1 font-semibold leading-snug">{offer.title}</h3>
        {offer.description && <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>}
        {offer.action_type === "endereco" && offer.address && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-glow" /> {offer.address}
          </p>
        )}
        <div className="mt-auto space-y-2 pt-4">
          <CouponArea offer={offer} />
          {href && (
            <Button asChild variant="outline" className="w-full">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <ActionIcon /> {actionLabel(offer.action_type)}
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
});

function CodeBox({ code, label }: { code: string; label?: string }) {
  return (
    <div>
      {label && <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-primary-glow/50 bg-primary/10 p-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate font-friendly text-base font-semibold tracking-wider text-primary-glow">{code}</span>
        <Button
          size="sm"
          variant="hero"
          onClick={async () => {
            const ok = await copyText(code);
            if (ok) toast.success(`Cupom ${code} copiado!`, { description: "Cole no carrinho da loja para aplicar o desconto." });
            else toast.error("Não foi possível copiar. Selecione o código e copie manualmente.");
          }}
        >
          <Copy /> Copiar Cupom
        </Button>
      </div>
    </div>
  );
}

function CouponArea({ offer }: { offer: ClubOffer }) {
  const claim = useServerFn(claimCoupon);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const state = associateCouponState(offer);

  function patchOffer(patch: Partial<ClubOffer>) {
    queryClient.setQueryData<ClubData>(["club"], (old) =>
      old ? { ...old, offers: old.offers.map((o) => (o.id === offer.id ? { ...o, ...patch } : o)) } : old,
    );
  }

  async function onClaim() {
    setBusy(true);
    try {
      const res = await claim({ data: { offerId: offer.id } });
      if (res.ok) {
        patchOffer({ my_coupon: res.code, coupons_left: Math.max(0, offer.coupons_left - 1) });
        const copied = await copyText(res.code);
        toast.success(`O cupom ${res.code} é seu!`, {
          description: copied ? "Já copiamos para você. Ele fica guardado aqui no card." : "Ele fica guardado aqui no card.",
        });
      } else if (res.reason === "esgotado") {
        patchOffer({ coupons_left: 0 });
        toast.error("Os cupons desta oferta acabaram.", { description: "Fique de olho: novos lotes podem chegar." });
      } else {
        toast.error("Esta oferta não está mais disponível.");
      }
    } catch {
      toast.error("Não foi possível pegar o cupom agora. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  if (state.kind === "shared") return <CodeBox code={state.code} />;
  if (state.kind === "mine") return <CodeBox code={state.code} label="Seu cupom exclusivo" />;
  if (state.kind === "available") {
    return (
      <div className="space-y-1.5">
        <Button variant="hero" className="w-full" onClick={onClaim} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Gift />} Pegar meu cupom
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Cupom exclusivo, 1 por Associado · {state.left === 1 ? "resta 1" : `restam ${state.left}`}
        </p>
      </div>
    );
  }
  if (state.kind === "sold_out") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-background/50 px-4 py-2.5 text-xs text-muted-foreground">
        <TicketX className="h-4 w-4 shrink-0" /> Cupons esgotados. Fique de olho: novos lotes podem chegar.
      </p>
    );
  }
  return (
    <p className="rounded-2xl bg-background/50 px-4 py-2.5 text-xs text-muted-foreground">
      Sem cupom: apresente sua carteirinha para usar este benefício.
    </p>
  );
}
