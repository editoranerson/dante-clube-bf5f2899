import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_UNIVERSO_URL } from "./brand";

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
  },
  staleTime: 5 * 60_000,
});

export function useUniversoUrl(): string {
  const { data } = useQuery(settingsQuery);
  return data?.["universo_url"] || DEFAULT_UNIVERSO_URL;
}
