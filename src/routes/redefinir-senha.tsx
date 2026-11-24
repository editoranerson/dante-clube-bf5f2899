import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/club/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMainSupabase, translateAuthError } from "@/lib/main-supabase";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar nova senha — Dante Clube" },
      { name: "description", content: "Crie uma nova senha para sua conta de Associado do Dante Clube." },
      { property: "og:title", content: "Criar nova senha — Dante Clube" },
      { property: "og:description", content: "Crie uma nova senha para sua conta de Associado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = getMainSupabase();
    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });
    client.auth.getSession().then(({ data }) => setStatus(data.session ? "ready" : "invalid"));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setBusy(true);
    const { error: err } = await getMainSupabase().auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(translateAuthError(err.message));
    toast.success("Senha atualizada!");
    navigate({ to: "/clube", replace: true });
  }

  return (
    <AuthShell title="Criar nova senha">
      {status === "checking" ? (
        <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
      ) : status === "invalid" ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Este link expirou ou já foi usado. Peça um novo na tela de login.</p>
          <Button asChild variant="hero" size="lg" className="w-full"><Link to="/entrar">Ir para o login</Link></Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Repita a nova senha</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Salvar nova senha
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
