import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadClubImage } from "@/lib/staff";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  folder,
  label,
  shape = "wide",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label: string;
  shape?: "wide" | "square";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadClubImage(file, folder));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no envio da imagem.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className={cn("relative overflow-hidden rounded-2xl border border-dashed border-border bg-background/50", shape === "wide" ? "h-32 w-full" : "h-24 w-24")}>
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-foreground" aria-label="Remover imagem">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground" disabled={busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {busy ? "Enviando…" : "Enviar imagem"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
