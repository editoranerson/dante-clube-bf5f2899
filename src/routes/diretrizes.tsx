import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalPage } from "@/components/club/InstitutionalPage";

export const Route = createFileRoute("/diretrizes")({
  head: () => ({
    meta: [
      { title: "Diretrizes da Comunidade — Dante Clube" },
      { name: "description", content: "Como participar do Dante Clube com respeito e usar os benefícios de forma justa." },
      { property: "og:title", content: "Diretrizes da Comunidade — Dante Clube" },
      { property: "og:description", content: "Como participar do Dante Clube com respeito e usar os benefícios de forma justa." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InstitutionalPage slug="diretrizes" fallbackTitle="Diretrizes da Comunidade" />,
});
