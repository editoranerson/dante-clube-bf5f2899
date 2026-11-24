import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RichText } from "./RichText";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { UniversoLogo } from "./UniversoLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export function pageQuery(slug: string) {
  return {
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("slug, title, content, updated_at").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  };
}

export function InstitutionalPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { data, isLoading } = useQuery(pageQuery(slug));
  const router = useRouter();
  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-5 pt-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))}
          className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground transition-colors hover:bg-accent"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link to="/">
          <UniversoLogo className="h-6" />
        </Link>
        <span className="w-10" />
      </header>
      <article className="mt-8 rounded-3xl border border-border bg-card/70 p-6 shadow-soft md:p-10">
        <p className="font-friendly text-sm text-primary-glow">Dante Clube</p>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">{data?.title ?? fallbackTitle}</h1>
        {data?.updated_at && (
          <p className="mt-2 text-xs text-muted-foreground">Atualizado em {formatDate(data.updated_at)}</p>
        )}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : data?.content ? (
            <RichText content={data.content} />
          ) : (
            <p className="text-muted-foreground">Este conteúdo ainda está sendo preparado.</p>
          )}
        </div>
      </article>
      <InstitutionalFooter />
    </div>
  );
}
