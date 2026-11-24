import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { setMyDanteAvatar, type ClubData } from "@/lib/associate.functions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function DanteAvatarPicker({
  open,
  onOpenChange,
  avatars,
  currentSrc,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  avatars: ClubData["avatars"];
  currentSrc: string;
}) {
  const save = useServerFn(setMyDanteAvatar);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);

  async function choose(id: string, name: string) {
    setSaving(id);
    try {
      const res = await save({ data: { avatarId: id } });
      if (!res.ok) throw new Error("fail");
      queryClient.setQueryData<ClubData>(["club"], (old) =>
        old ? { ...old, associate: { ...old.associate, dante_avatar_id: id } } : old,
      );
      toast.success(`${name} agora está na sua carteirinha!`);
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível trocar o visual agora. Tente de novo.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Trocar visual do Dante</DialogTitle>
          <DialogDescription>Escolha a versão do Dante que vai aparecer na sua carteirinha.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto p-1">
          {avatars.map((a) => {
            const selected = a.image_url === currentSrc;
            return (
              <button
                key={a.id}
                type="button"
                disabled={saving !== null}
                onClick={() => (selected ? onOpenChange(false) : choose(a.id, a.name))}
                aria-pressed={selected}
                className="group flex flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                <span
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden rounded-2xl bg-gradient-primary ring-2 transition-all",
                    selected ? "ring-primary-glow" : "ring-transparent group-hover:ring-border",
                  )}
                >
                  <img src={a.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {(selected || saving === a.id) && (
                    <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary-glow text-primary-foreground">
                      {saving === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-tight">{a.name}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
