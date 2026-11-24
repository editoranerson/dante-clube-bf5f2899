import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsQuery } from "@/lib/settings";
import { DEFAULT_UNIVERSO_URL } from "@/lib/brand";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export function SettingsTab({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const settings = useQuery(settingsQuery);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (settings.data) setUrl(settings.data["universo_url"] || DEFAULT_UNIVERSO_URL);
  }, [settings.data]);

  async function saveUrl() {
    if (!/^https?:\/\/\S+\.\S+/i.test(url.trim())) return toast.error("Informe um link válido, começando com https://");
    setBusy(true);
    const { error } = await supabase.from("settings").upsert({ key: "universo_url", value: url.trim() });
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar.");
    toast.success("Link do Universo Dante atualizado!");
    void queryClient.invalidateQueries({ queryKey: settingsQuery.queryKey });
  }

  async function onPasswordChanged() {
    await supabase.from("settings").upsert({ key: "admin_default_password_active", value: "false" });
    void queryClient.invalidateQueries({ queryKey: settingsQuery.queryKey });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Link do Universo Dante</h2>
        <p className="mt-1 text-sm text-muted-foreground">Usado no botão “Visitar Universo Dante” e no Acesso rápido dos Associados.</p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="set-url">Endereço do site</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="set-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://queridodante.site" />
            <Button variant="hero" onClick={saveUrl} disabled={busy} className="shrink-0">{busy ? <Loader2 className="animate-spin" /> : <Save />} Salvar</Button>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Sua conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">Conectado como <strong className="text-foreground">{email}</strong>.</p>
        {settings.data?.["admin_default_password_active"] === "true" && (
          <p className="mt-3 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary-glow">
            A senha de teste ainda está ativa e aparece na tela de login. Troque-a para esconder a senha de teste.
          </p>
        )}
        <div className="mt-4"><ChangePasswordDialog onChanged={onPasswordChanged} /></div>
      </section>
    </div>
  );
}
