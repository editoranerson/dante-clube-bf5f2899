import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, KeyRound, Loader2, Pencil, Plus, Store, Trash2, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/club/EmptyState";
import { ImageUpload } from "./ImageUpload";
import { StoreOffers } from "./StoreOffers";
import { ConfirmDelete } from "./ConfirmDelete";
import { createPartnerAccess } from "@/lib/staff.functions";

type StoreRow = Tables<"stores"> & { offers: { count: number }[] };

export function StoresTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const stores = useQuery({
    queryKey: ["staff", "stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*, offers(count)").order("name");
      if (error) throw error;
      return (data ?? []) as StoreRow[];
    },
  });
  const selected = stores.data?.find((s) => s.id === selectedId) ?? null;

  if (selected) return <StoreDetail store={selected} onBack={() => setSelectedId(null)} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Cadastre lojas e ofertas. O parceiro não precisa ter conta.</p>
        <Button variant="hero" onClick={() => setFormOpen(true)}><Plus /> Nova loja</Button>
      </div>
      {stores.isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-3xl" />)}</div>
      ) : (stores.data ?? []).length === 0 ? (
        <EmptyState icon={<Store />} title="Nenhuma loja cadastrada" action={<Button variant="soft" onClick={() => setFormOpen(true)}><Plus /> Cadastrar loja</Button>}>
          Comece cadastrando o primeiro parceiro do Dante Clube.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {(stores.data ?? []).map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => setSelectedId(s.id)} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:border-primary-glow/40">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-card text-primary-glow">
                  {s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-6 w-6" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {s.offers[0]?.count ?? 0} {(s.offers[0]?.count ?? 0) === 1 ? "oferta" : "ofertas"}
                    {s.owner_email ? ` · acesso: ${s.owner_email}` : " · sem conta de parceiro"}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <StoreFormDialog open={formOpen} onOpenChange={setFormOpen} store={null} onSaved={(id) => setSelectedId(id)} />
    </div>
  );
}

function StoreDetail({ store, onBack }: { store: StoreRow; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  async function removeStore() {
    const { error } = await supabase.from("stores").delete().eq("id", store.id);
    if (error) return toast.error("Não foi possível excluir a loja.");
    toast.success("Loja excluída");
    await queryClient.invalidateQueries({ queryKey: ["staff", "stores"] });
    onBack();
  }
  async function unlinkPartner() {
    const { error } = await supabase.from("stores").update({ owner_id: null, owner_email: null }).eq("id", store.id);
    if (error) return toast.error("Não foi possível remover o acesso.");
    toast.success("Acesso do parceiro removido");
    void queryClient.invalidateQueries({ queryKey: ["staff", "stores"] });
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Todas as lojas
      </button>
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-card text-primary-glow">
            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-7 w-7" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold">{store.name}</h2>
            {store.description && <p className="mt-1 text-sm text-muted-foreground">{store.description}</p>}
            {store.address && <p className="mt-1 text-xs text-muted-foreground">{store.address}</p>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil /> Editar loja</Button>
          <ConfirmDelete title="Excluir loja?" description="A loja e todas as ofertas dela serão removidas do clube." onConfirm={removeStore}>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 /> Excluir</Button>
          </ConfirmDelete>
        </div>
        <div className="mt-4 rounded-2xl bg-background/50 p-4">
          <p className="text-sm font-semibold">Acesso do parceiro</p>
          {store.owner_email ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Entra com <strong className="text-foreground">{store.owner_email}</strong> em “Acesso Parceiro & Gestão”.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAccessOpen(true)}><KeyRound /> Nova senha</Button>
                <ConfirmDelete title="Remover acesso?" description="O parceiro não poderá mais gerenciar as ofertas desta loja." confirmLabel="Remover" onConfirm={unlinkPartner}>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><UserX /> Remover</Button>
                </ConfirmDelete>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Opcional: crie um login para o parceiro cuidar das próprias ofertas.</p>
              <Button variant="soft" size="sm" onClick={() => setAccessOpen(true)}><KeyRound /> Criar acesso</Button>
            </div>
          )}
        </div>
      </section>
      <div className="mt-6">
        <StoreOffers storeId={store.id} canFeature defaults={{ website: store.website, address: store.address }} />
      </div>
      <StoreFormDialog open={editOpen} onOpenChange={setEditOpen} store={store} />
      <PartnerAccessDialog open={accessOpen} onOpenChange={setAccessOpen} storeId={store.id} email={store.owner_email} />
    </div>
  );
}

function StoreFormDialog({ open, onOpenChange, store, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; store: Tables<"stores"> | null; onSaved?: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(store?.name ?? "");
    setDescription(store?.description ?? "");
    setWebsite(store?.website ?? "");
    setAddress(store?.address ?? "");
    setLogo(store?.logo_url ?? null);
    setError(null);
  }, [open, store]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Informe o nome da loja.");
    if (website.trim() && !/^https?:\/\//i.test(website.trim())) return setError("O site precisa começar com https://");
    const row = { name: name.trim().slice(0, 100), description: description.trim().slice(0, 300), website: website.trim() || null, address: address.trim() || null, logo_url: logo };
    setBusy(true);
    const res = store
      ? await supabase.from("stores").update(row).eq("id", store.id).select("id").single()
      : await supabase.from("stores").insert(row).select("id").single();
    setBusy(false);
    if (res.error) return setError("Não foi possível salvar a loja.");
    toast.success(store ? "Loja atualizada!" : "Loja cadastrada! Agora adicione as ofertas.");
    await queryClient.invalidateQueries({ queryKey: ["staff", "stores"] });
    onOpenChange(false);
    onSaved?.(res.data.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-xl">{store ? "Editar loja" : "Nova loja"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <ImageUpload label="Logo" value={logo} onChange={setLogo} folder="stores" shape="square" />
          <div className="space-y-2"><Label htmlFor="st-name">Nome</Label><Input id="st-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="st-desc">Descrição</Label><Textarea id="st-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="st-site">Site (opcional)</Label><Input id="st-site" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" /></div>
          <div className="space-y-2"><Label htmlFor="st-addr">Endereço (opcional)</Label><Input id="st-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Para benefícios presenciais" /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Salvar loja</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PartnerAccessDialog({ open, onOpenChange, storeId, email: currentEmail }: { open: boolean; onOpenChange: (o: boolean) => void; storeId: string; email: string | null }) {
  const queryClient = useQueryClient();
  const create = useServerFn(createPartnerAccess);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setEmail(currentEmail ?? "");
      setPassword("");
      setError(null);
    }
  }, [open, currentEmail]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Informe um e-mail válido.");
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    setBusy(true);
    try {
      const res = await create({ data: { storeId, email: email.trim(), password } });
      if (!res.ok) return setError(res.error);
      toast.success("Acesso do parceiro pronto!", { description: "Envie o e-mail e a senha para o parceiro." });
      await queryClient.invalidateQueries({ queryKey: ["staff", "stores"] });
      onOpenChange(false);
    } catch {
      setError("Não foi possível criar o acesso agora.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{currentEmail ? "Nova senha do parceiro" : "Criar acesso do parceiro"}</DialogTitle>
          <DialogDescription>O parceiro entra em “Acesso Parceiro & Gestão” e gerencia só as ofertas desta loja.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="pa-email">E-mail do parceiro</Label><Input id="pa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!currentEmail} /></div>
          <div className="space-y-2"><Label htmlFor="pa-pass">Senha</Label><Input id="pa-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="off" /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Salvar acesso</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
