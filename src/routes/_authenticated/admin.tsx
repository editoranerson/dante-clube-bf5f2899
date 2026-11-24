import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BookText, QrCode, Rocket, Settings, Sparkles, Store, Tags, Users } from "lucide-react";
import { getMyStaffRoles } from "@/lib/staff";
import { StaffHeader, StaffTabs } from "@/components/staff/StaffHeader";
import { AssociatesTab } from "@/components/staff/AssociatesTab";
import { StoresTab } from "@/components/staff/StoresTab";
import { CategoriesTab } from "@/components/staff/CategoriesTab";
import { MissionsTab } from "@/components/staff/MissionsTab";
import { PagesTab } from "@/components/staff/PagesTab";
import { SettingsTab } from "@/components/staff/SettingsTab";
import { AvatarsTab } from "@/components/staff/AvatarsTab";
import { Validator } from "@/components/staff/Validator";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const me = await getMyStaffRoles();
    if (!me) throw redirect({ to: "/auth" });
    if (!me.roles.includes("admin")) throw redirect({ to: "/painel" });
    return { email: me.email };
  },
  head: () => ({
    meta: [
      { title: "Painel Administrativo — Dante Clube" },
      { name: "description", content: "Gestão de Associados, lojas, ofertas e páginas do Dante Clube." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel Administrativo — Dante Clube" },
      { property: "og:description", content: "Gestão do Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Tab = "associados" | "lojas" | "categorias" | "missoes" | "paginas" | "avatares" | "validador" | "ajustes";

function AdminPage() {
  const { email } = Route.useRouteContext();
  const [tab, setTab] = useState<Tab>("associados");
  return (
    <div className="min-h-screen pb-16">
      <StaffHeader title="Painel Administrativo" subtitle={email} />
      <StaffTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "associados", label: "Associados", icon: Users },
          { value: "lojas", label: "Lojas & Ofertas", icon: Store },
          { value: "categorias", label: "Categorias", icon: Tags },
          { value: "missoes", label: "Missões", icon: Rocket },
          { value: "avatares", label: "Avatares", icon: Sparkles },
          { value: "paginas", label: "Páginas", icon: BookText },
          { value: "validador", label: "Validador", icon: QrCode },
          { value: "ajustes", label: "Ajustes", icon: Settings },
        ]}
      />
      <main className="mx-auto max-w-5xl px-4 pt-5">
        {tab === "associados" && <AssociatesTab />}
        {tab === "lojas" && <StoresTab />}
        {tab === "categorias" && <CategoriesTab />}
        {tab === "missoes" && <MissionsTab />}
        {tab === "avatares" && <AvatarsTab />}
        {tab === "paginas" && <PagesTab />}
        {tab === "validador" && <Validator />}
        {tab === "ajustes" && <SettingsTab email={email} />}
      </main>
    </div>
  );
}
