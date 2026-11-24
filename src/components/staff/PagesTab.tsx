import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Loader2, Pencil, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RichText } from "@/components/club/RichText";
import { cn } from "@/lib/utils";

const PAGES = [
  { slug: "termos", label: "Termos de Uso" },
  { slug: "diretrizes", label: "Diretrizes" },
  { slug: "privacidade", label: "Privacidade" },
] as const;

export function PagesTab() {
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState<string>("termos");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const page = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("slug, title, content, updated_at").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    if (page.data) {
      setTitle(page.data.title);
      setContent(page.data.content);
    }
  }, [page.data]);

  async function save() {
    if (title.trim().length < 2) return toast.error("Informe o título da página.");
    setBusy(true);
    const { error } = await supabase.from("pages").update({ title: title.trim(), content, updated_at: new Date().toISOString() }).eq("slug", slug);
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar.");
    toast.success("Página publicada!");
    void queryClient.invalidateQueries({ queryKey: ["page", slug] });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {PAGES.map((p) => (
          <button key={p.slug} type="button" onClick={() => { setSlug(p.slug); setPreview(false); }} className={cn("h-9 shrink-0 rounded-full px-4 text-sm font-semibold", slug === p.slug ? "bg-primary/20 text-primary-glow" : "bg-card text-muted-foreground hover:text-foreground")}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        {page.isLoading ? (
          <div className="space-y-3"><Skeleton className="h-11" /><Skeleton className="h-64" /></div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="pg-title">Título</Label><Input id="pg-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pg-content">Conteúdo</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
                {preview ? <><Pencil /> Editar</> : <><Eye /> Pré-visualizar</>}
              </Button>
            </div>
            {preview ? (
              <div className="rounded-2xl bg-background/50 p-5"><RichText content={content} /></div>
            ) : (
              <>
                <Textarea id="pg-content" rows={16} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">Dica: comece uma linha com “## ” para criar um título e com “- ” para criar uma lista. Deixe uma linha em branco entre parágrafos.</p>
              </>
            )}
            <Button variant="hero" size="lg" className="w-full sm:w-auto" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Save />} Salvar e publicar</Button>
          </div>
        )}
      </div>
    </div>
  );
}
