import { DANTE_AVATAR_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function DanteAvatar({ className, ring = true, src }: { className?: string; ring?: boolean; src?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-card",
        ring && "ring-2 ring-primary-glow/70 ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <img
        src={src ?? DANTE_AVATAR_URL}
        alt="Dante, mascote do Universo Querido Dante"
        width={320}
        height={320}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
