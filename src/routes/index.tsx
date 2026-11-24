import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Handshake, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DanteAvatar } from "@/components/club/DanteAvatar";
import { UniversoLogo } from "@/components/club/UniversoLogo";
import { InstitutionalFooter } from "@/components/club/InstitutionalFooter";
import { useUniversoUrl } from "@/lib/settings";
import { OG_HOME_IMAGE_PATH } from "@/lib/brand";
import { getSiteOrigin } from "@/lib/site";

const TITLE = "Dante Clube — Participe, é grátis!";
const DESCRIPTION = "O clube de benefícios oficial e gratuito do Universo Querido Dante.";

export const Route = createFileRoute("/")({
  loader: () => ({ origin: getSiteOrigin() }),
  head: ({ loaderData }) => {
    const image = loaderData ? `${loaderData.origin}${OG_HOME_IMAGE_PATH}` : null;
    return {
      meta: [
        { title: TITLE },
        {
          name: "description",
          content:
            "Bem-vindo ao Dante Clube, o clube de benefícios do Universo Querido Dante. Cupons, carteirinha digital e missões. Participe, é grátis!",
        },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Dante Clube" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        ...(image
          ? [
              { property: "og:image", content: image },
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "630" },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  component: Home,
});

function Home() {
  const universoUrl = useUniversoUrl();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 pt-6 md:max-w-md md:pt-12">
      <header className="flex justify-center">
        <UniversoLogo className="h-6 md:h-7" />
      </header>

      <main className="flex flex-1 flex-col items-center pt-7 text-center md:pt-10">
        <div className="relative">
          <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-primary/25 blur-2xl" aria-hidden="true" />
          <DanteAvatar className="h-24 w-24 md:h-28 md:w-28" />
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-3 py-1 font-friendly text-xs font-semibold text-success-foreground shadow-lg">
            100% Gratuito
          </span>
        </div>

        <h1 className="mt-7 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Dante <span className="bg-gradient-primary bg-clip-text text-transparent">Clube</span>
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground md:max-w-sm md:text-base">
          Bem-vindo ao Dante Clube, o clube de benefícios do Universo Querido Dante. Participe, é grátis!
        </p>

        <div className="mt-7 flex w-full flex-col gap-2.5">
          <Button asChild variant="hero" size="lg" className="w-full">
            <Link to="/entrar">
              <UserRound />
              Entrar como Associado
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/auth">
              <Handshake />
              Acesso Parceiro & Gestão
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full text-primary-glow hover:text-primary-glow">
            <a href={universoUrl} target="_blank" rel="noopener noreferrer">
              Visitar Universo Dante
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
