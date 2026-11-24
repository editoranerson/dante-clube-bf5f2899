import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { UniversoLogo } from "./UniversoLogo";
import { formatDate, formatMemberId, formatValidationCode } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BadgeAssociate = {
  full_name: string;
  member_number: number;
  status: string;
  created_at: string;
  validation_code: string;
};

function UserAvatar({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-3xl bg-gradient-primary ring-2 ring-primary-glow/60", className)}>
      <img src={src} alt="Avatar do Dante escolhido pelo Associado" crossOrigin="anonymous" className="h-full w-full object-cover" />
    </div>
  );
}

export function StatusSeal({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", active ? "bg-success" : "bg-destructive")} />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export const BadgeFront = forwardRef<HTMLDivElement, { a: BadgeAssociate; avatarSrc: string; className?: string }>(function BadgeFront(
  { a, avatarSrc, className },
  ref,
) {
  const active = a.status === "ativo";
  return (
    <div ref={ref} className={cn("flex h-full flex-col rounded-[2rem] border border-primary-glow/25 bg-gradient-card p-6 text-foreground shadow-soft", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <UniversoLogo className="h-7" />
          <p className="mt-1.5 text-xs text-muted-foreground">Dante Clube · Identificação Oficial</p>
        </div>
        <StatusSeal active={active} />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <UserAvatar src={avatarSrc} className="h-24 w-24" />
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold leading-tight [overflow-wrap:anywhere]">{a.full_name || "Associado"}</p>
          <p className="mt-1 font-friendly text-lg font-medium text-primary-glow">Associado</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-background/40 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID do Associado</p>
          <p className="mt-0.5 font-friendly text-3xl font-semibold tracking-wide">{formatMemberId(a.member_number)}</p>
        </div>
        <div className="rounded-2xl bg-background/40 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Desde</p>
          <p className="mt-1.5 text-xl font-semibold">{formatDate(a.created_at)}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
        <span>Toque para virar</span>
        <QrCode className="h-7 w-7 text-foreground/60" />
      </div>
    </div>
  );
});

export const BadgeBack = forwardRef<HTMLDivElement, { a: BadgeAssociate; qrValue: string; className?: string }>(
  function BadgeBack({ a, qrValue, className }, ref) {
    return (
      <div ref={ref} className={cn("flex h-full flex-col items-center rounded-[2rem] border border-primary-glow/25 bg-card p-6 text-center text-foreground shadow-soft", className)}>
        <div className="rounded-3xl bg-foreground p-3 shadow-glow">
          <QRCodeSVG value={qrValue} size={150} level="M" bgColor="transparent" fgColor="#0b0613" />
        </div>
        <p className="mt-4 font-semibold">{a.full_name || "Associado"}</p>
        <p className="text-sm text-muted-foreground">ID {formatMemberId(a.member_number)}</p>
        <div className="mt-4 w-full rounded-2xl bg-background/50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Código de validação</p>
          <p className="mt-1 font-mono text-base tracking-wider">{formatValidationCode(a.validation_code, a.member_number)}</p>
        </div>
        <p className="mt-auto pt-4 text-xs text-muted-foreground">Toque para virar</p>
      </div>
    );
  },
);
