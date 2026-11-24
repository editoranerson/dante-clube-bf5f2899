import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary-glow [&_svg]:h-6 [&_svg]:w-6">
        {icon}
      </div>
      <h3 className="font-friendly text-lg font-medium text-foreground">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
