import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function StaffHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background-deep/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-accent" aria-label="Voltar ao site">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <ShieldCheck className="h-6 w-6 text-primary-glow" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold leading-tight">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button type="button" onClick={signOut} className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-accent" aria-label="Sair">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function StaffTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; icon: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="sticky top-16 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="no-scrollbar mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3" role="tablist">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.value === value;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.value)}
              className={
                active
                  ? "flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow"
                  : "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              }
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
