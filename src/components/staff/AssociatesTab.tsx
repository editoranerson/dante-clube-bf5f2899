import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, Loader2, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/club/EmptyState";
import { formatDate, formatMemberId, formatValidationCode, initials, normalizeText } from "@/lib/format";
import { cn } from "@/lib/utils";

type Associate = Tables<"associates">;
type Filter = "todos" | "ativo" | "descredenciado";

function StatusPill({ status }: { status: string }) {
  const active = status === "ativo";
  return (
    <span className={cn("inline-flex rounded-full px-3 py-0.5 text-xs font-semibold", active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
      {active ? "ativo" : "descredenciado"}
    </span>
  );
}

export function AssociatesTab() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [selected, setSelected] = useState<Associate | null>(null);
  const [busy, setBusy] = useState(false);
  const list = useQuery({
    queryKey: ["staff", "associates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("associates").select("*").order("member_number", { ascending: false }).limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const all = list.data ?? [];
  const counts = { todos: all.length, ativo: all.filter((a) => a.status === "ativo").length, descredenciado: all.filter((a) => a.status !== "ativo").length };
  const visible = useMemo(() => {
    const q = normalizeText(query.trim());
    return all.filter((a) => {
      if (filter !== "todos" && a.status !== filter) return false;
      if (!q) return true;
      return normalizeText(`${a.full_name} ${a.email} d-${a.member_number} d${a.member_number}`).includes(q);
    });
  }, [all, query, filter]);

  async function setStatus(a: Associate, status: "ativo" | "descredenciado") {
    setBusy(true);
    const { data, error } = await supabase.from("associates").update({ status }).eq("id", a.id).select("*").single();
    setBusy(false);
    if (error) return toast.error("Não foi possível alterar o status.");
    toast.success(status === "ativo" ? `${formatMemberId(a.member_number)} reativado` : `${formatMemberId(a.member_number)} descredenciado`);
    setSelected(data);
    void queryClient.invalidateQueries({ queryKey: ["staff", "associates"] });
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, e-mail ou ID (D-100)" className="h-12 rounded-full pl-11" aria-label="Buscar associados" />
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {(["todos", "ativo", "descredenciado"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("h-9 shrink-0 rounded-full px-4 text-sm font-semibold", filter === f ? "bg-primary/20 text-primary-glow" : "bg-card text-muted-foreground hover:text-foreground")}>
            {f === "todos" ? "Todos" : f === "ativo" ? "Ativos" : "Descredenciados"} · {counts[f]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {list.isLoading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div>
        ) : all.length === 0 ? (
          <EmptyState icon={<Users />} title="Nenhum Associado ainda">Quando alguém entrar no clube pela primeira vez, a matrícula aparece aqui.</EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState icon={<Search />} title="Ninguém encontrado">Tente outro nome, e-mail ou ID.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {visible.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => setSelected(a)} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:border-primary-glow/40">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary font-friendly text-lg font-semibold text-primary-foreground">
                    {a.avatar_url ? <img src={a.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(a.full_name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{a.full_name || a.email}</span>
                    <span className="block truncate text-sm text-muted-foreground">{formatMemberId(a.member_number)} · desde {formatDate(a.created_at)}</span>
                    <span className="mt-1.5 block"><StatusPill status={a.status} /></span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="font-display text-xl">Dados do Associado</DialogTitle></DialogHeader>
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary font-friendly text-xl font-semibold text-primary-foreground">
                  {selected.avatar_url ? <img src={selected.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(selected.full_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-semibold">{selected.full_name || "Sem nome"}</p>
                  <StatusPill status={selected.status} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info label="ID" value={formatMemberId(selected.member_number)} />
                <Info label="Desde" value={formatDate(selected.created_at)} />
                <Info label="E-mail" value={selected.email || "—"} wide />
                <Info label="Código de validação" value={formatValidationCode(selected.validation_code, selected.member_number)} wide />
              </dl>
              {selected.status === "ativo" ? (
                <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={busy} onClick={() => setStatus(selected, "descredenciado")}>
                  {busy && <Loader2 className="animate-spin" />} Descredenciar Associado
                </Button>
              ) : (
                <Button variant="success" className="w-full" disabled={busy} onClick={() => setStatus(selected, "ativo")}>
                  {busy && <Loader2 className="animate-spin" />} Reativar Associado
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("rounded-2xl bg-background/50 px-4 py-3", wide && "col-span-2")}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-all font-medium">{value}</dd>
    </div>
  );
}
