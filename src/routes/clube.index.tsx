import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, CalendarHeart, LogOut, Rocket, ShieldCheck, ShieldX, Sparkles, Ticket } from "lucide-react";
import { useClub } from "@/components/club/ClubContext";
import { DanteAvatar } from "@/components/club/DanteAvatar";
import { CategoryIcon } from "@/components/club/CategoryIcon";
import { OfferVisual } from "@/components/club/OfferVisual";
import { EmptyState } from "@/components/club/EmptyState";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { getMainSupabase } from "@/lib/main-supabase";
import { useUniversoUrl } from "@/lib/settings";
import { resolveDanteAvatar } from "@/lib/brand";
import { firstName, formatDate, formatMemberId } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clube/")({
  head: () => ({
    meta: [
      { title: "Início — Dante Clube" },
      { name: "description", content: "Seu painel de Associado do Dante Clube." },
      { property: "og:title", content: "Início — Dante Clube" },
      { property: "og:description", content: "Seu painel de Associado do Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClubHome,
});

const tintClasses = [
  "bg-tint-emerald/15 text-tint-emerald",
  "bg-tint-sky/15 text-tint-sky",
  "bg-tint-violet/15 text-tint-violet",
];

function ClubHome() {
  const { associate, categories, offers, avatars } = useClub();
  const universoUrl = useUniversoUrl();
  const active = associate.status === "ativo";
  const featured = offers.filter((o) => o.featured);
  const highlights = featured.length ? featured : offers.slice(0, 5);
  const catIcon = (id: string | null) => categories.find((c) => c.id === id)?.icon;

  const tileBase = "flex flex-col items-center gap-2 rounded-2xl p-1 text-center text-xs font-medium text-foreground/90 transition-transform hover:-translate-y-0.5";
  const bubble = "grid h-14 w-14 place-items-center rounded-full [&_svg]:h-6 [&_svg]:w-6";

  return (
    <div>
      <header className="relative rounded-b-[2.5rem] bg-gradient-hero px-5 pb-20 pt-8 md:rounded-b-[3rem] md:px-8">
        <button
          type="button"
          onClick={() => getMainSupabase().auth.signOut()}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/25 text-foreground backdrop-blur transition-colors hover:bg-background/40"
          aria-label="Sair da conta"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
        <div className="flex items-center gap-4">
          <Link to="/clube/carteirinha" aria-label="Ver minha carteirinha" className="shrink-0 rounded-full">
            <DanteAvatar src={resolveDanteAvatar(avatars, associate.dante_avatar_id)} className="h-20 w-20 md:h-24 md:w-24" />
          </Link>
          <div className="min-w-0">
            <p className="text-sm text-foreground/80">Olá,</p>
            <h1 className="truncate font-display text-3xl font-semibold leading-tight md:text-4xl">
              {firstName(associate.full_name) || "Associado"}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-background/25 px-3 py-1 font-friendly text-sm font-medium backdrop-blur">Associado</span>
              <span className="rounded-full bg-background/25 px-3 py-1 font-friendly text-sm font-medium backdrop-blur">
                {formatMemberId(associate.member_number)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative -mt-12 space-y-5 px-4 md:px-6">
        <section className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            {active ? <CalendarHeart className="h-6 w-6" /> : <ShieldX className="h-6 w-6" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Status do associado</p>
            <p className={cn("text-lg font-bold", active ? "text-success" : "text-destructive")}>{active ? "Ativo" : "Descredenciado"}</p>
            <p className="text-sm text-muted-foreground">
              {active ? `Associado desde ${formatDate(associate.created_at)}` : "Seu acesso aos benefícios está suspenso. Fale com a equipe do Universo Dante."}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Acesso rápido</h2>
          <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-5">
            <Link to="/clube/beneficios" className={tileBase}>
              <span className={cn(bubble, "bg-tint-pink/15 text-tint-pink")}><Ticket /></span>
              Benefícios
            </Link>
            {categories.slice(0, 3).map((c, i) => (
              <Link key={c.id} to="/clube/beneficios" search={{ cat: c.id }} className={tileBase}>
                <span className={cn(bubble, tintClasses[i % tintClasses.length])}><CategoryIcon name={c.icon} /></span>
                <span className="line-clamp-2 leading-tight">{c.name}</span>
              </Link>
            ))}
            <Link to="/clube/carteirinha" className={tileBase}>
              <span className={cn(bubble, "bg-tint-rose/15 text-tint-rose")}><BadgeCheck /></span>
              Carteirinha
            </Link>
            <Link to="/clube/missoes" className={tileBase}>
              <span className={cn(bubble, "bg-tint-lilac/15 text-tint-lilac")}><Rocket /></span>
              Missões
            </Link>
            <a href={universoUrl} target="_blank" rel="noopener noreferrer" className={tileBase}>
              <span className={cn(bubble, "bg-tint-pink/15 text-tint-pink")}><Sparkles /></span>
              <span className="leading-tight">Universo Dante</span>
            </a>
            <Link to="/diretrizes" className={tileBase}>
              <span className={cn(bubble, "bg-tint-sky/15 text-tint-sky")}><ShieldCheck /></span>
              Diretrizes
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between px-1">
            <h2 className="font-display text-xl font-semibold">Destaques da semana</h2>
            {highlights.length > 0 && (
              <Link to="/clube/beneficios" className="text-sm font-semibold text-primary-glow hover:underline">Ver todos</Link>
            )}
          </div>
          {!active ? (
            <EmptyState icon={<ShieldX />} title="Benefícios suspensos">
              Enquanto seu cadastro estiver descredenciado, os destaques ficam indisponíveis.
            </EmptyState>
          ) : highlights.length === 0 ? (
            <EmptyState icon={<Sparkles />} title="Novidades a caminho">
              Os primeiros parceiros estão chegando. Volte em breve para ver os destaques!
            </EmptyState>
          ) : (
            <HighlightsCarousel items={highlights} catIcon={catIcon} />
          )}
        </section>
      </div>
    </div>
  );
}

function HighlightsCarousel({
  items,
  catIcon,
}: {
  items: ReturnType<typeof useClub>["offers"];
  catIcon: (id: string | null) => string | undefined;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);
  return (
    <div>
      <Carousel setApi={setApi} opts={{ align: "start", loop: items.length > 2 }}>
        <CarouselContent className="-ml-3">
          {items.map((o) => (
            <CarouselItem key={o.id} className="basis-[85%] pl-3 sm:basis-1/2">
              <Link
                to="/clube/beneficios"
                search={{ destaque: o.id }}
                className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="relative h-36 overflow-hidden">
                  <OfferVisual cover={o.cover_url} logo={o.store_logo} icon={catIcon(o.category_id)} alt={o.store_name} className="transition-transform duration-500 group-hover:scale-105" />
                  {o.discount_label && (
                    <span className="absolute left-3 top-3 rounded-full bg-gradient-primary px-3 py-1 font-friendly text-sm font-semibold text-primary-foreground shadow-glow">
                      {o.discount_label}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{o.store_name}</p>
                  <p className="mt-0.5 line-clamp-1 font-semibold">{o.title}</p>
                  <p className="mt-2 text-sm font-semibold text-primary-glow">Ver benefício →</p>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((o, i) => (
            <button
              key={o.id}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary-glow" : "w-1.5 bg-muted-foreground/40")}
              aria-label={`Ir para destaque ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
