import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { getClubData } from "@/lib/associate.functions";
import { getMainSupabase } from "@/lib/main-supabase";
import { ClubContext } from "@/components/club/ClubContext";
import { BottomNav } from "@/components/club/BottomNav";
import { DanteAvatar } from "@/components/club/DanteAvatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clube")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await getMainSupabase().auth.getSession();
    if (!data.session) throw redirect({ to: "/entrar" });
  },
  head: () => ({
    meta: [
      { title: "Meu Dante Clube" },
      { name: "description", content: "Seus benefícios, carteirinha e missões do Dante Clube." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Meu Dante Clube" },
      { property: "og:description", content: "Seus benefícios, carteirinha e missões do Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClubLayout,
});

function ClubLayout() {
  const fetchClub = useServerFn(getClubData);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["club"], queryFn: () => fetchClub(), staleTime: 60_000, retry: 1 });

  useEffect(() => {
    const { data: sub } = getMainSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: ["club"] });
        navigate({ to: "/", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, queryClient]);

  const unauthorized = query.error instanceof Error && query.error.message.includes("Unauthorized");
  useEffect(() => {
    if (unauthorized) {
      getMainSupabase().auth.signOut().finally(() => navigate({ to: "/entrar", replace: true }));
    }
  }, [unauthorized, navigate]);

  if (query.isPending || unauthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5">
        <DanteAvatar className="h-20 w-20 animate-pulse" />
        <p className="font-friendly text-muted-foreground">Abrindo seu Dante Clube…</p>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <DanteAvatar className="h-16 w-16" ring={false} />
        <h1 className="font-display text-2xl font-semibold">Não conseguimos carregar agora</h1>
        <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
        <Button variant="hero" onClick={() => query.refetch()}>
          <RefreshCw /> Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <ClubContext.Provider value={query.data}>
      <div className="mx-auto min-h-screen w-full max-w-2xl pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </ClubContext.Provider>
  );
}
