import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { z } from "zod";
import { AuthShell } from "@/components/club/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getMainSupabase, translateAuthError } from "@/lib/main-supabase";
import { cn } from "@/lib/utils";

type Tab = "login" | "cadastro";
type Search = { aba?: Tab; confirmado?: string };

export const Route = createFileRoute("/entrar")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(s["aba"] === "cadastro" || s["aba"] === "login" ? { aba: s["aba"] } : {}),
    ...(typeof s["confirmado"] === "string" ? { confirmado: s["confirmado"] } : {}),
  }),
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar como Associado — Dante Clube" },
      { name: "description", content: "Entre ou crie sua conta gratuita de Associado no Dante Clube." },
      { property: "og:title", content: "Entrar como Associado — Dante Clube" },
      { property: "og:description", content: "Entre ou crie sua conta gratuita de Associado no Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EntrarPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres").max(72),
});

function EntrarPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(search.aba ?? "login");
  const [view, setView] = useState<"form" | "forgot" | "check-email" | "reset-sent">("form");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getMainSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!alive) return;
        if (data.session) navigate({ to: "/clube", replace: true });
        else if (search.confirmado) toast.success("E-mail confirmado! Agora é só entrar.");
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Preencha e-mail e senha.");
    setBusy(true);
    const { error: err } = await getMainSupabase().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) return setError(translateAuthError(err.message));
    navigate({ to: "/clube", replace: true });
  }

  async function onSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Verifique os dados.");
    if (!accepted) return setError("Para participar, aceite os Termos de Uso e a Política de Privacidade.");
    setBusy(true);
    const { data, error: err } = await getMainSupabase().auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/entrar?confirmado=1`,
        data: { full_name: parsed.data.name, name: parsed.data.name, dante_clube_terms_accepted_at: new Date().toISOString() },
      },
    });
    setBusy(false);
    if (err) return setError(translateAuthError(err.message));
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return setError("Este e-mail já tem conta no Universo Dante. Use a aba Login.");
    }
    if (data.session) return navigate({ to: "/clube", replace: true });
    setView("check-email");
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!z.string().email().safeParse(email.trim()).success) return setError("Informe um e-mail válido.");
    setBusy(true);
    const { error: err } = await getMainSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setBusy(false);
    if (err) return setError(translateAuthError(err.message));
    setView("reset-sent");
  }

  if (view === "check-email" || view === "reset-sent") {
    const isReset = view === "reset-sent";
    return (
      <AuthShell title={isReset ? "Confira seu e-mail" : "Quase lá!"}>
        <div className="flex flex-col items-center py-2 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
            <MailCheck className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {isReset ? "Enviamos um link para criar uma nova senha em " : "Enviamos um link de confirmação para "}
            <strong className="text-foreground">{email.trim()}</strong>.
            {isReset ? " Abra o e-mail e siga as instruções." : " Confirme seu e-mail e depois faça login para receber sua matrícula."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Não chegou? Veja a caixa de spam ou promoções.</p>
          <Button
            variant="hero"
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              setView("form");
              switchTab("login");
              setPassword("");
            }}
          >
            {isReset ? "Voltar ao login" : "Já confirmei, fazer login"}
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (view === "forgot") {
    return (
      <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha.">
        <form onSubmit={onForgot} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">E-mail</Label>
            <Input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Enviar link
          </Button>
          <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => { setView("form"); setError(null); }}>
            Voltar ao login
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Área do Associado" subtitle="Use a mesma conta do site Universo Querido Dante.">
      <div role="tablist" aria-label="Entrar ou cadastrar" className="grid grid-cols-2 rounded-full bg-background/70 p-1">
        {(["login", "cadastro"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => switchTab(t)}
            className={cn(
              "h-10 rounded-full text-sm font-semibold transition-all",
              tab === t ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "login" ? "Login" : "Cadastro"}
          </button>
        ))}
      </div>

      {tab === "login" ? (
        <form onSubmit={onLogin} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail</Label>
            <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Senha</Label>
              <button type="button" className="text-xs font-medium text-primary-glow hover:underline" onClick={() => { setView("forgot"); setError(null); }}>
                Esqueci minha senha
              </button>
            </div>
            <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Entrar
          </Button>
        </form>
      ) : (
        <form onSubmit={onSignup} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Nome completo</Label>
            <Input id="signup-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você quer ser chamado" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">E-mail</Label>
            <Input id="signup-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Senha</Label>
            <Input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" />
          </div>
          <label className="flex items-start gap-3 rounded-2xl bg-background/50 p-3 text-sm text-muted-foreground">
            <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5" aria-label="Aceito os Termos de Uso e a Política de Privacidade" />
            <span>
              Li e aceito os{" "}
              <Link to="/termos" target="_blank" className="font-medium text-primary-glow hover:underline">Termos de Uso</Link>{" "}
              e a{" "}
              <Link to="/privacidade" target="_blank" className="font-medium text-primary-glow hover:underline">Política de Privacidade</Link>.
            </span>
          </label>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Criar conta grátis
          </Button>
          <p className="text-center text-xs text-muted-foreground">Não pedimos CPF. É grátis para sempre.</p>
        </form>
      )}
    </AuthShell>
  );
}
