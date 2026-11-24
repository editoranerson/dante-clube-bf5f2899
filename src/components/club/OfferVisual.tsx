import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

/** Cover image, store logo, or a branded gradient with the category icon. */
export function OfferVisual({
  cover,
  logo,
  icon,
  alt,
  className,
}: {
  cover: string | null;
  logo: string | null;
  icon: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (cover)
    return <img src={cover} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  return (
    <div className={cn("grid h-full w-full place-items-center bg-gradient-card", className)}>
      {logo ? (
        <img src={logo} alt={alt} loading="lazy" className="h-16 w-16 rounded-2xl bg-card object-cover shadow-soft" />
      ) : (
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/20 text-primary-glow">
          <CategoryIcon name={icon} className="h-8 w-8" />
        </span>
      )}
    </div>
  );
}
