import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { QrCode, Store, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyStaffRoles } from "@/lib/staff";
import { StaffHeader, StaffTabs } from "@/components/staff/StaffHeader";
import { StoreOffers } from "@/components/staff/StoreOffers";
import { Validator } from "@/components/staff/Validator";
import { EmptyState } from "@/components/club/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordDialog } from "@/components/staff/ChangePasswordDialog";

export const Route = createFileRoute("/_authenticated/painel")({
  beforeLoad: async () => {
    const me = await getMyStaffRoles();
    if (!me) throw redirect({ to: "/auth" });
    if (me.roles.includes("admin")) throw redirect({ to: "/admin" });
    if (!me.roles.includes("partner")) throw redirect({ to: "/auth" });
    return { email: me.email, userId: me.userId };
  },
  head: () => ({
    meta: [
      { title: "Painel do Parceiro — Dante Clube" },
      { name: "description", content: "Gerencie suas ofertas e valide Associados do Dante Clube." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel do Parceiro — Dante Clube" },
      { property: "og:description", content: "Gerencie suas ofertas e valide Associados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PartnerPage,
});

type Tab = "ofertas" | "validador";

function PartnerPage() {
  const { email, userId } = Route.useRouteContext();
  const [tab, setTab] = useState<Tab>("ofertas");
  const store = useQuery({
    queryKey: ["staff", "my-store", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").eq("owner_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="min-h-screen pb-16">
      <StaffHeader title="Painel do Parceiro" subtitle={store.data?.name ?? email} />
      <StaffTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "ofertas", label: "Minhas ofertas", icon: Tag },
          { value: "validador", label: "Validador", icon: QrCode },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 pt-5">
        {tab === "validador" ? (
          <Validator />
        ) : store.isLoading ? (
          <Skeleton className="h-40 rounded-3xl" />
        ) : !store.data ? (
          <EmptyState icon={<Store />} title="Loja ainda não vinculada">
            Sua conta ainda não está ligada a uma loja. Fale com a gestão do Dante Clube.
          </EmptyState>
        ) : (
          <>
            <StoreOffers storeId={store.data.id} canFeature={false} defaults={{ website: store.data.website, address: store.data.address }} />
            <div className="mt-8"><ChangePasswordDialog /></div>
          </>
        )}
      </main>
    </div>
  );
}
