import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SearchX, ShieldX, Sparkles, X } from "lucide-react";
import { useClub } from "@/components/club/ClubContext";
import { OfferCard } from "@/components/club/OfferCard";
import { EmptyState } from "@/components/club/EmptyState";
import { CategoryIcon } from "@/components/club/CategoryIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { filterOffers } from "@/lib/format";
import { cn } from "@/lib/utils";

type Search = { cat?: string; destaque?: string };

export const Route = createFileRoute("/clube/beneficios")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s["cat"] === "string" ? { cat: s["cat"] } : {}),
    ...(typeof s["destaque"] === "string" ? { destaque: s["destaque"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Benefícios — Dante Clube" },
      { name: "description", content: "Cupons e descontos exclusivos para Associados do Dante Clube." },
      { property: "og:title", content: "Benefícios — Dante Clube" },
      { property: "og:description", content: "Cupons e descontos exclusivos para Associados do Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BenefitsPage,
});

function BenefitsPage() {
  const { associate, categories, offers } = useClub();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [query, setQuery] = useState("");
  const category = search.cat && categories.some((c) => c.id === search.cat) ? search.cat : null;
  const highlightRef = useRef<HTMLElement | null>(null);

  const visible = useMemo(() => filterOffers(offers, category, query), [offers, category, query]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  useEffect(() => {
    if (search.destaque && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [search.destaque]);

  const setCategory = (id: string | null) =>
    navigate({ search: () => (id ? { cat: id } : {}), replace: true });

  return (
    <div className="px-4 pt-8 md:px-6">
      <h1 className="font-display text-3xl font-semibold">Benefícios</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cupons e descontos exclusivos para Associados.</p>

      {associate.status !== "ativo" ? (
        <EmptyState className="mt-8" icon={<ShieldX />} title="Benefícios suspensos">
          Seu cadastro está descredenciado no momento. Fale com a equipe do Universo Dante para regularizar.
        </EmptyState>
      ) : (
        <>
          <div className="sticky top-0 z-20 -mx-4 mt-5 space-y-3 bg-background/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar loja, e-book ou desconto"
                className="h-12 rounded-full pl-11 pr-11"
                aria-label="Buscar benefícios"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Limpar busca">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:-mx-6 md:px-6" role="tablist" aria-label="Categorias">
              <Pill active={!category} onClick={() => setCategory(null)}>Todos</Pill>
              {categories.map((c) => (
                <Pill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  <CategoryIcon name={c.icon} className="h-4 w-4" />
                  {c.name}
                </Pill>
              ))}
            </div>
          </div>

          {offers.length === 0 ? (
            <EmptyState className="mt-6" icon={<Sparkles />} title="Benefícios chegando">
              Estamos fechando parcerias incríveis para você. Volte em breve!
            </EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={<SearchX />}
              title="Nada encontrado"
              action={
                <Button variant="soft" onClick={() => { setQuery(""); setCategory(null); }}>
                  Ver todos os benefícios
                </Button>
              }
            >
              {query ? `Não achamos benefícios para “${query}”.` : "Ainda não há benefícios nesta categoria."}
            </EmptyState>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {visible.map((o) => {
                const cat = o.category_id ? catById.get(o.category_id) : undefined;
                const isHighlight = search.destaque === o.id;
                return (
                  <OfferCard
                    key={o.id}
                    ref={isHighlight ? highlightRef : undefined}
                    offer={o}
                    highlighted={isHighlight}
                    {...(cat ? { categoryName: cat.name, categoryIcon: cat.icon } : {})}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all",
        active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "border border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
