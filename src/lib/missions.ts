import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const missionsQuery = queryOptions({
  queryKey: ["missions"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("missions")
      .select("id, title, platform, description, reward, url, steps, sort_order, active")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },
});
