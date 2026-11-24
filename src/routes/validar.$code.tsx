import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Loader2, SearchX, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DanteAvatar } from "@/components/club/DanteAvatar";
import { UniversoLogo } from "@/components/club/UniversoLogo";
import { Button } from "@/components/ui/button";
import { formatDate, formatMemberId } from "@/lib/format";

export const Route = createFileRoute("/validar/$code")({
  head: () => ({
    meta: [
      { title: "Validação de Associado — Dante Clube" },
      { name: "description", content: "Confira se a carteirinha do Associado Dante Clube está ativa." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Validação de Associado — Dante Clube" },
      { property: "og:description", content: "Confira se a carteirinha do Associado Dante Clube está ativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ValidatePage,
});

function ValidatePage() {
  const { code } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["public-validate", code],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_validate", { _code: code });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
  const active = data?.status === "ativo";
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 pt-10 text-center">
      <UniversoLogo className="h-7" />
      <div className="mt-8 w-full rounded-3xl border border-border bg-card/80 p-7 shadow-soft">
        <DanteAvatar className="mx-auto h-16 w-16" />
        <p className="mt-4 font-friendly text-sm text-primary-glow">Validação de Associado</p>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
        ) : !data ? (
          <div className="py-6">
            <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-3 font-display text-2xl font-semibold">Carteirinha não encontrada</h1>
            <p className="mt-2 text-sm text-muted-foreground">Este código não corresponde a nenhum Associado.</p>
          </div>
        ) : (
          <div className="py-4">
            {active ? <BadgeCheck className="mx-auto h-12 w-12 text-success" /> : <ShieldX className="mx-auto h-12 w-12 text-destructive" />}
            <h1 className="mt-3 font-display text-3xl font-semibold">{data.first_name}</h1>
            <p className="mt-1 font-friendly text-lg text-muted-foreground">{formatMemberId(data.member_number)}</p>
            <span className={active ? "mt-4 inline-flex rounded-full bg-success/15 px-4 py-1.5 text-sm font-semibold text-success" : "mt-4 inline-flex rounded-full bg-destructive/15 px-4 py-1.5 text-sm font-semibold text-destructive"}>
              {active ? "Associado Ativo" : "Associado Inativo"}
            </span>
            <p className="mt-3 text-xs text-muted-foreground">Associado desde {formatDate(data.since)}</p>
          </div>
        )}
      </div>
      <Button asChild variant="ghost" className="mt-6"><Link to="/">Conhecer o Dante Clube</Link></Button>
    </div>
  );
}
