import {
  BookOpen,
  Coffee,
  Gamepad2,
  Gift,
  GraduationCap,
  Headphones,
  Heart,
  MapPin,
  Music,
  Pizza,
  Plane,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Ticket,
  Tv,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "shopping-bag": ShoppingBag,
  "map-pin": MapPin,
  tag: Tag,
  gift: Gift,
  ticket: Ticket,
  coffee: Coffee,
  pizza: Pizza,
  shirt: Shirt,
  gamepad: Gamepad2,
  music: Music,
  headphones: Headphones,
  tv: Tv,
  plane: Plane,
  graduation: GraduationCap,
  heart: Heart,
  store: Store,
  sparkles: Sparkles,
};

export function CategoryIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = CATEGORY_ICONS[name ?? ""] ?? Tag;
  return <Icon className={className} aria-hidden="true" />;
}
