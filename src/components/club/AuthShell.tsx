import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DanteAvatar } from "./DanteAvatar";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-6">
      <Link
        to="/"
        className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground transition-colors hover:bg-accent"
        aria-label="Voltar ao início"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="mt-4 flex flex-col items-center text-center">
        <DanteAvatar className="h-20 w-20" />
        <h1 className="mt-5 font-display text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="mt-7 rounded-3xl border border-border bg-card/80 p-5 shadow-soft backdrop-blur md:p-7">{children}</div>
    </div>
  );
}
