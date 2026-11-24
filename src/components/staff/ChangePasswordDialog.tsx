import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { translateAuthError } from "@/lib/main-supabase";

export function ChangePasswordDialog({ onChanged }: { onChanged?: () => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("A nova senha precisa ter pelo menos 8 caracteres.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: next, current_password: current });
    setBusy(false);
    if (err) return setError(translateAuthError(err.message));
    toast.success("Senha alterada!");
    setOpen(false);
    setCurrent("");
    setNext("");
    onChanged?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><KeyRound /> Alterar senha</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl border-border bg-card">
        <DialogHeader><DialogTitle className="font-display">Alterar senha</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cur-pass">Senha atual</Label>
            <Input id="cur-pass" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pass">Nova senha</Label>
            <Input id="new-pass" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Mínimo de 8 caracteres" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Salvar nova senha
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
