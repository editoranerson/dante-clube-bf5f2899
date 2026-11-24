import { useCallback, useState, type FormEvent } from "react";
import { BadgeCheck, Loader2, QrCode, Search, SearchX, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrScannerDialog } from "./QrScannerDialog";
import { formatDate, formatMemberId, normalizeValidationQuery } from "@/lib/format";

type Result = { member_number: number; full_name: string; status: string; since: string } | null;

export function Validator() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const lookup = useCallback(async (raw: string) => {
    const q = normalizeValidationQuery(raw);
    if (!q) return setError("Digite o ID do Associado (ex: D-100) ou escaneie o QR Code.");
    setError(null);
    setBusy(true);
    const { data, error: err } = await supabase.rpc("validate_associate", { _query: q });
    setBusy(false);
    if (err) return setError("Não foi possível consultar agora. Tente novamente.");
    setResult(data?.[0] ?? null);
  }, []);

  const onScan = useCallback(
    (text: string) => {
      setQuery(normalizeValidationQuery(text));
      void lookup(text);
    },
    [lookup],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void lookup(query);
  }

  const active = result?.status === "ativo";

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Validador de Associados</h2>
        <p className="mt-1 text-sm text-muted-foreground">Consulte pelo ID (D-100) ou escaneie o QR Code da carteirinha.</p>
        <form onSubmit={onSubmit} className="mt-5 flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="D-100" className="h-12 font-friendly text-lg uppercase tracking-wider" aria-label="ID do Associado" autoCapitalize="characters" />
          <Button type="submit" variant="hero" size="lg" className="shrink-0 px-5" disabled={busy} aria-label="Consultar">
            {busy ? <Loader2 className="animate-spin" /> : <Search />}
            <span className="hidden sm:inline">Consultar</span>
          </Button>
        </form>
        <Button variant="soft" size="lg" className="mt-3 w-full" onClick={() => setScanOpen(true)}>
          <QrCode /> Escanear QR Code
        </Button>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {result !== undefined && (
        <div className="mt-4 rounded-3xl border border-border bg-card p-6 text-center shadow-soft animate-in fade-in slide-in-from-bottom-2">
          {result === null ? (
            <>
              <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Associado não encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">Confira o ID ou peça para o Associado mostrar o QR Code.</p>
            </>
          ) : (
            <>
              {active ? <BadgeCheck className="mx-auto h-14 w-14 text-success" /> : <ShieldX className="mx-auto h-14 w-14 text-destructive" />}
              <p className={active ? "mt-2 text-2xl font-bold text-success" : "mt-2 text-2xl font-bold text-destructive"}>{active ? "Ativo" : "Inativo"}</p>
              <p className="mt-3 font-display text-2xl font-semibold">{result.full_name || "Associado"}</p>
              <p className="font-friendly text-lg text-muted-foreground">{formatMemberId(result.member_number)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Associado desde {formatDate(result.since)}</p>
              {!active && <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-2 text-sm text-destructive">Este Associado está descredenciado e não pode usar os benefícios.</p>}
            </>
          )}
        </div>
      )}
      <QrScannerDialog open={scanOpen} onOpenChange={setScanOpen} onResult={onScan} />
    </div>
  );
}
