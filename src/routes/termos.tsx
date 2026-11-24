import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalPage } from "@/components/club/InstitutionalPage";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Dante Clube" },
      { name: "description", content: "Regras de uso do Dante Clube, o clube de benefícios gratuito do Universo Querido Dante." },
      { property: "og:title", content: "Termos de Uso — Dante Clube" },
      { property: "og:description", content: "Regras de uso do Dante Clube, o clube de benefícios gratuito do Universo Querido Dante." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InstitutionalPage slug="termos" fallbackTitle="Termos de Uso" />,
});
