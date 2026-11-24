import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/club/EmptyState";
import { ImageUpload } from "./ImageUpload";
import { ConfirmDelete } from "./ConfirmDelete";
import { cn } from "@/lib/utils";

type DanteAvatar = Tables<"dante_avatars">;

const avatarsQueryKey = ["staff", "dante-avatars"] as const;

export function AvatarsTab() {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: avatarsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("dante_avatars").select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DanteAvatar | null>(null);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: avatarsQueryKey });

  async function setDefault(a: DanteAvatar) {
    const { error } = await supabase.rpc("set_default_dante_avatar", { _avatar_id: a.id });
    if (error) return toast.error("Não foi possível definir o avatar padrão.");
    toast.success(`${a.name} é agora o avatar padrão.`);
    refresh();
  }

  async function remove(a: DanteAvatar) {
    const { error } = await supabase.from("dante_avatars").delete().eq("id", a.id);
    if (error) return toast.error("Não foi possível excluir o avatar.");
    toast.success("Avatar removido.");
    refresh();
  }

  const avatars = list.data ?? [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Avatares do Dante</h2>
        <Button variant="hero" size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus /> Nova pose
        </Button>
      </div>

      {list.isLoading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div>
      ) : avatars.length === 0 ? (
        <EmptyState icon={<Sparkles />} title="Nenhuma pose cadastrada" action={<Button variant="soft" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Cadastrar primeira pose</Button>}>
          Cadastre as versões do Dante que os Associados podem escolher para a carteirinha.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {avatars.map((a) => (
            <li key={a.id} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
              <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary ring-2 ring-primary-glow/50">
                <img src={a.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-semibold">{a.name}</p>
                  {a.is_default && (
                    <Badge className="gap-1 bg-tint-lilac/15 text-tint-lilac"><Star className="h-3 w-3" /> Padrão</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Ordem: {a.sort_order}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!a.is_default && (
                  <Button variant="outline" size="sm" onClick={() => setDefault(a)}>
                    <Check className="h-3.5 w-3.5" /> Definir padrão
                  </Button>
                )}
                <button type="button" onClick={() => { setEditing(a); setOpen(true); }} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Editar avatar">
                  <Pencil className="h-4 w-4" />
                </button>
                <ConfirmDelete title="Excluir avatar?" description={`"${a.name}" deixará de aparecer para os Associados.`} onConfirm={() => remove(a)}>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Excluir avatar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </ConfirmDelete>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AvatarFormDialog open={open} onOpenChange={setOpen} avatar={editing} onSaved={refresh} />
    </div>
  );
}

function AvatarFormDialog({ open, onOpenChange, avatar, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; avatar: DanteAvatar | null; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(avatar?.name ?? "");
    setImageUrl(avatar?.image_url ?? null);
    setSortOrder(avatar?.sort_order ?? 0);
    setError(null);
  }, [open, avatar]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Dê um nome para a versão (ex: Dante Leitor).");
    if (!imageUrl) return setError("Envie ou informe a imagem do avatar.");
    const row = { name: name.trim(), image_url: imageUrl, sort_order: sortOrder };
    setBusy(true);
    const res = avatar
      ? await supabase.from("dante_avatars").update(row).eq("id", avatar.id)
      : await supabase.from("dante_avatars").insert(row);
    setBusy(false);
    if (res.error) return setError("Não foi possível salvar o avatar. Tente novamente.");
    toast.success(avatar ? "Avatar atualizado!" : "Nova pose cadastrada!");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl">{avatar ? "Editar pose" : "Nova pose do Dante"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="av-name">Nome da versão</Label>
            <Input id="av-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dante com Fone, Dante Leitor" />
          </div>
          <ImageUpload label="Imagem (quadrada)" value={imageUrl} onChange={setImageUrl} folder="avatars" shape="square" />
          <div className="space-y-2">
            <Label htmlFor="av-order">Ordem de exibição</Label>
            <Input id="av-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} />
            <p className="text-xs text-muted-foreground">Poses com menor número aparecem primeiro.</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Salvar pose
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
