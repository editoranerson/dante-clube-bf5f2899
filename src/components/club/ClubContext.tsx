import { createContext, useContext } from "react";
import type { ClubData } from "@/lib/associate.functions";

export const ClubContext = createContext<ClubData | null>(null);

export function useClub(): ClubData {
  const ctx = useContext(ClubContext);
  if (!ctx) throw new Error("useClub must be used inside the associate area");
  return ctx;
}
