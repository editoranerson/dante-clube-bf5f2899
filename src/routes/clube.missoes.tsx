import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Gift, Info, Rocket } from "lucide-react";
import { missionsQuery } from "@/lib/missions";
import { EmptyState } from "@/components/club/EmptyState";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clube/missoes")({
  head: () => ({
    meta: [
      { title: "Missões & Recompensas — Dante Clube" },
      { name: "description", content: "Pontue em plataformas parceiras e resgate prêmios com o passo a passo do Dante Clube." },
      { property: "og:title", content: "Missões & Recompensas — Dante Clube" },
      { property: "og:description", content: "Pontue em plataformas parceiras e resgate prêmios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MissionsPage,
});

const tints = ["bg-tint-sky/15 text-tint-sky", "bg-tint-pink/15 text-tint-pink", "bg-tint-emerald/15 text-tint-emerald", "bg-tint-lilac/15 text-tint-lilac"];

function MissionsPage() {
  const { data, isLoading, isError, refetch } = useQuery(missionsQuery);
  const missions = (data ?? []).filter((m) => m.active);
  return (
    <div className="px-4 pt-8 md:px-6">
      <h1 className="font-display text-3xl font-semibold">Missões & Recompensas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pontue em plataformas parceiras e resgate prêmios direto nelas. Aqui você encontra o caminho.
      </p>

      <div className="mt-5 flex gap-3 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" />
        <p>As recompensas são dadas pelas próprias plataformas. O Dante Clube não acumula pontos: siga o passo a passo e resgate lá.</p>
      </div>

      <div className="mt-5 space-y-4">
        {isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-44 rounded-3xl" />)
        ) : isError ? (
          <EmptyState icon={<Rocket />} title="Não conseguimos carregar as missões" action={<Button variant="soft" onClick={() => refetch()}>Tentar de novo</Button>} />
        ) : missions.length === 0 ? (
          <EmptyState icon={<Rocket />} title="Novas missões em breve">
            Estamos preparando missões para você pontuar e ganhar prêmios.
          </EmptyState>
        ) : (
          missions.map((m, i) => (
            <article key={m.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full", tints[i % tints.length])}>
                  <Rocket className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">{m.platform}</p>
                  <h2 className="font-semibold leading-snug">{m.title}</h2>
                  {m.reward && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                      <Gift className="h-3.5 w-3.5" /> {m.reward}
                    </span>
                  )}
                </div>
              </div>
              {m.description && <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>}
              {m.steps.length > 0 && (
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="steps" className="border-b-0">
                    <AccordionTrigger className="py-3 text-sm font-semibold text-primary-glow hover:no-underline">
                      Como participar
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3">
                        {m.steps.map((s, idx) => (
                          <li key={idx} className="flex gap-3 text-sm">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 font-friendly text-xs font-semibold text-primary-glow">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5 text-foreground/85">{s}</span>
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {m.url && (
                <Button asChild variant="hero" className="mt-2 w-full">
                  <a href={m.url} target="_blank" rel="noopener noreferrer">
                    Abrir missão <ArrowUpRight />
                  </a>
                </Button>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
