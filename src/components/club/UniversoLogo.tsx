import { UNIVERSO_LOGO_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function UniversoLogo({ className }: { className?: string }) {
  return (
    <img
      src={UNIVERSO_LOGO_URL}
      alt="Universo Dante"
      width={1230}
      height={200}
      decoding="async"
      className={cn("h-8 w-auto select-none", className)}
      draggable={false}
    />
  );
}
