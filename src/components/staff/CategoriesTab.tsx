import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/club/EmptyState";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/club/CategoryIcon";
import { ConfirmDelete } from "./ConfirmDelete";
import { categoriesQuery } from "./StoreOffers";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; icon: string; sort_order: number };

export function CategoriesTab() {
  const queryClient = useQueryClient();
  const cats = useQuery(categoriesQuery);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [open, setOpen] = useState(false);
  const list = cats.data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: categoriesQuery.queryKey });

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    const a = list[index];
    const b = list[target];
    if (!a || !b) return;
    const reordered = [...list];
    reordered[index] = b;
    reordered[target] = a;
    const results = await Promise.all(reordered.map((c, i) => supabase.from("categories").update({ sort_order: i + 1 }).eq("id", c.id)));
    if (results.some((r) => r.error)) toast.error("Não foi possível reordenar.");
    void refresh();
  }
  async function remove(c: Cat) {
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error("Não foi possível excluir.");
    toast.success("Categoria excluída");
    void refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">A ordem aqui é a ordem das pílulas em Benefícios.</p>
        <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Nova</Button>
      </div>
      {cats.isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-3xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={<Tags />} title="Nenhuma categoria">Crie categorias como E-books, Lojas Online e Presencial.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {list.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 pl-4 shadow-soft">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary-glow"><CategoryIcon name={c.icon} className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
              <div className="flex items-center gap-0.5">
                <IconBtn label="Subir" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
                <IconBtn label="Descer" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
                <IconBtn label="Editar" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></IconBtn>
                <ConfirmDelete title="Excluir categoria?" description="As ofertas desta categoria continuam no clube, mas ficam sem categoria." onConfirm={() => remove(c)}>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
                </ConfirmDelete>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CategoryDialog open={open} onOpenChange={setOpen} category={editing} nextOrder={list.length + 1} onSaved={() => void refresh()} />
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30">
      {children}
    </button>
  );
}

function CategoryDialog({ open, onOpenChange, category, nextOrder, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; category: Cat | null; nextOrder: number; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("tag");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setIcon(category?.icon ?? "tag");
      setError(null);
    }
  }, [open, category]);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Informe o nome da categoria.");
    setBusy(true);
    const row = { name: name.trim().slice(0, 40), icon };
    const res = category ? await supabase.from("categories").update(row).eq("id", category.id) : await supabase.from("categories").insert({ ...row, sort_order: nextOrder });
    setBusy(false);
    if (res.error) return setError("Não foi possível salvar.");
    toast.success(category ? "Categoria atualizada!" : "Categoria criada!");
    onSaved();
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl">{category ? "Editar categoria" : "Nova categoria"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="cat-name">Nome</Label><Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Games" /></div>
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2">
              {Object.keys(CATEGORY_ICONS).map((k) => (
                <button key={k} type="button" onClick={() => setIcon(k)} aria-label={k} aria-pressed={icon === k} className={cn("grid aspect-square place-items-center rounded-2xl border transition-all", icon === k ? "border-primary-glow bg-primary/20 text-primary-glow" : "border-border bg-background/50 text-muted-foreground hover:text-foreground")}>
                  <CategoryIcon name={k} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
