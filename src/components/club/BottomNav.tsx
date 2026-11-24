import { Link, useRouterState } from "@tanstack/react-router";
import { BadgeCheck, House, Rocket, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/clube", label: "Início", icon: House, exact: true },
  { to: "/clube/beneficios", label: "Benefícios", icon: Ticket, exact: false },
  { to: "/clube/carteirinha", label: "Carteirinha", icon: BadgeCheck, exact: false, badge: true },
  { to: "/clube/missoes", label: "Missões", icon: Rocket, exact: false },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Navegação do Associado"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to || pathname === `${t.to}/` : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <li key={t.to} className="relative">
              <Link
                to={t.to}
                className={cn(
                  "flex h-[68px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                  active ? "text-primary-glow" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {"badge" in t ? (
                  <span
                    className={cn(
                      "-mt-6 grid h-12 w-12 place-items-center rounded-full transition-all",
                      active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-primary/15 text-primary-glow",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "absolute top-0 h-1 w-10 rounded-b-full bg-primary-glow transition-opacity",
                        active ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                    <Icon className="h-6 w-6" />
                  </>
                )}
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
