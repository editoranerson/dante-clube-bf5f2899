import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Rocket, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/club/EmptyState";
import { ConfirmDelete } from "./ConfirmDelete";
import { missionsQuery } from "@/lib/missions";

type Mission = Pick<Tables<"missions">, "id" | "title" | "platform" | "description" | "reward" | "url" | "steps" | "sort_order" | "active">;

export function MissionsTab() {
  const queryClient = useQueryClient();
  const q = useQuery(missionsQuery);
  const list = q.data ?? [];
  const [editing, setEditing] = useState<Mission | null>(null);
  const [open, setOpen] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: missionsQuery.queryKey });

  async function move(i: number, dir: -1 | 1) {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b) return;
    const re = [...list];
    re[i] = b;
    re[i + dir] = a;
    await Promise.all(re.map((m, idx) => supabase.from("missions").update({ sort_order: idx + 1 }).eq("id", m.id)));
    void refresh();
  }
  async function remove(m: Mission) {
    const { error } = await supabase.from("missions").delete().eq("id", m.id);
    if (error) return toast.error("Não foi possível excluir.");
    toast.success("Missão excluída");
    void refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Links de indicação e bônus externos, com passo a passo.</p>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Nova</Button>
      </div>
      {q.isLoading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-3xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={<Rocket />} title="Nenhuma missão">Adicione links como Microsoft Rewards ou Amazon.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {list.map((m, i) => (
            <li key={m.id} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 pl-4 shadow-soft">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tint-sky/15 text-tint-sky"><Rocket className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{m.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{m.platform} · {m.steps.length} passos{m.active ? "" : " · oculta"}</span>
              </span>
              <div className="flex items-center gap-0.5">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-30" aria-label="Subir"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-30" aria-label="Descer"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => { setEditing(m); setOpen(true); }} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                <ConfirmDelete title="Excluir missão?" description={`"${m.title}" sai da aba Missões.`} onConfirm={() => remove(m)}>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
                </ConfirmDelete>
              </div>
            </li>
          ))}
        </ul>
      )}
      <MissionDialog open={open} onOpenChange={setOpen} mission={editing} nextOrder={list.length + 1} onSaved={() => void refresh()} />
    </div>
  );
}

function MissionDialog({ open, onOpenChange, mission, nextOrder, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; mission: Mission | null; nextOrder: number; onSaved: () => void }) {
  const [f, setF] = useState({ title: "", platform: "", description: "", reward: "", url: "", steps: "", active: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setF({
        title: mission?.title ?? "",
        platform: mission?.platform ?? "",
        description: mission?.description ?? "",
        reward: mission?.reward ?? "",
        url: mission?.url ?? "",
        steps: (mission?.steps ?? []).join("\n"),
        active: mission?.active ?? true,
      });
      setError(null);
    }
  }, [open, mission]);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (f.title.trim().length < 2) return setError("Informe o título da missão.");
    if (!/^https?:\/\//i.test(f.url.trim())) return setError("O link precisa começar com https://");
    const row = {
      title: f.title.trim().slice(0, 120),
      platform: f.platform.trim().slice(0, 60),
      description: f.description.trim().slice(0, 500),
      reward: f.reward.trim().slice(0, 60),
      url: f.url.trim(),
      steps: f.steps.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 12),
      active: f.active,
    };
    setBusy(true);
    const res = mission ? await supabase.from("missions").update(row).eq("id", mission.id) : await supabase.from("missions").insert({ ...row, sort_order: nextOrder });
    setBusy(false);
    if (res.error) return setError("Não foi possível salvar.");
    toast.success(mission ? "Missão atualizada!" : "Missão criada!");
    onSaved();
    onOpenChange(false);
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-xl">{mission ? "Editar missão" : "Nova missão"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="mi-title">Título</Label><Input id="mi-title" value={f.title} onChange={set("title")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="mi-plat">Plataforma</Label><Input id="mi-plat" value={f.platform} onChange={set("platform")} placeholder="Ex: Amazon" /></div>
            <div className="space-y-2"><Label htmlFor="mi-rew">Recompensa</Label><Input id="mi-rew" value={f.reward} onChange={set("reward")} placeholder="Ex: Vale-presente" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="mi-url">Link de indicação</Label><Input id="mi-url" value={f.url} onChange={set("url")} placeholder="https://" /></div>
          <div className="space-y-2"><Label htmlFor="mi-desc">Descrição</Label><Textarea id="mi-desc" rows={2} value={f.description} onChange={set("description")} /></div>
          <div className="space-y-2"><Label htmlFor="mi-steps">Passo a passo (um por linha)</Label><Textarea id="mi-steps" rows={5} value={f.steps} onChange={set("steps")} /></div>
          <label className="flex items-center justify-between rounded-2xl bg-background/50 p-4 text-sm">
            <span className="font-medium">Mostrar para os Associados</span>
            <Switch checked={f.active} onCheckedChange={(v) => setF((p) => ({ ...p, active: v }))} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Salvar missão</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
