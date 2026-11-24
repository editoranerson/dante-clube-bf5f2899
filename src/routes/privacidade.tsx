import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalPage } from "@/components/club/InstitutionalPage";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Dante Clube" },
      { name: "description", content: "Quais dados o Dante Clube coleta, para que usa e quem pode ver." },
      { property: "og:title", content: "Política de Privacidade — Dante Clube" },
      { property: "og:description", content: "Quais dados o Dante Clube coleta, para que usa e quem pode ver." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InstitutionalPage slug="privacidade" fallbackTitle="Política de Privacidade" />,
});
