import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/club/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureDefaultAdmin } from "@/lib/staff.functions";
import { getMyStaffRoles } from "@/lib/staff";
import { settingsQuery } from "@/lib/settings";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso Parceiro & Gestão — Dante Clube" },
      { name: "description", content: "Entrada para parceiros e gestão do Dante Clube." },
      { property: "og:title", content: "Acesso Parceiro & Gestão — Dante Clube" },
      { property: "og:description", content: "Entrada para parceiros e gestão do Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const ensureAdmin = useServerFn(ensureDefaultAdmin);
  const settings = useQuery(settingsQuery);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function routeByRole() {
    const me = await getMyStaffRoles();
    if (!me) return false;
    if (me.roles.includes("admin")) navigate({ to: "/admin", replace: true });
    else if (me.roles.includes("partner")) navigate({ to: "/painel", replace: true });
    else {
      await supabase.auth.signOut();
      setError("Esta conta não tem acesso de parceiro ou gestão.");
      return false;
    }
    return true;
  }

  useEffect(() => {
    void ensureAdmin().catch(() => undefined);
    void routeByRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Preencha e-mail e senha.");
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setBusy(false);
      return setError("E-mail ou senha incorretos.");
    }
    await routeByRole();
    setBusy(false);
  }

  return (
    <AuthShell title="Acesso Parceiro & Gestão" subtitle="Para lojas parceiras e equipe do Dante Clube.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="st-email">E-mail</Label>
          <Input id="st-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="st-pass">Senha</Label>
          <Input id="st-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Entrar
        </Button>
      </form>
      {settings.data?.["admin_default_password_active"] !== "false" && (
        <div className="mt-5 rounded-2xl border border-dashed border-primary-glow/40 bg-primary/10 p-4 text-sm">
          <p className="font-semibold text-primary-glow">Acesso de teste do ADMIN</p>
          <p className="mt-1 text-muted-foreground">E-mail: <span className="text-foreground">{DEFAULT_ADMIN_EMAIL}</span></p>
          <p className="text-muted-foreground">Senha: <span className="font-mono text-foreground">{DEFAULT_ADMIN_PASSWORD}</span></p>
          <Button type="button" variant="soft" size="sm" className="mt-3" onClick={() => { setEmail(DEFAULT_ADMIN_EMAIL); setPassword(DEFAULT_ADMIN_PASSWORD); }}>
            Preencher
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
