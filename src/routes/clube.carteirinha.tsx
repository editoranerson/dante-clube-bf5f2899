import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileImage, FileText, Loader2, Share2, Sparkles } from "lucide-react";
import { useClub } from "@/components/club/ClubContext";
import { BadgeBack, BadgeFront } from "@/components/club/MemberBadge";
import { DanteAvatarPicker } from "@/components/club/DanteAvatarPicker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMemberId } from "@/lib/format";
import { resolveDanteAvatar } from "@/lib/brand";

export const Route = createFileRoute("/clube/carteirinha")({
  head: () => ({
    meta: [
      { title: "Carteirinha — Dante Clube" },
      { name: "description", content: "Sua carteirinha digital de Associado do Dante Clube." },
      { property: "og:title", content: "Carteirinha — Dante Clube" },
      { property: "og:description", content: "Sua carteirinha digital de Associado do Dante Clube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BadgePage,
});

const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function BadgePage() {
  const { associate, avatars } = useClub();
  const avatarSrc = resolveDanteAvatar(avatars, associate.dante_avatar_id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState<null | "png" | "pdf" | "share">(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const qrValue = typeof window !== "undefined" ? `${window.location.origin}/validar/${associate.validation_code}` : "";
  const fileBase = `carteirinha-dante-clube-${formatMemberId(associate.member_number)}`;

  async function renderPng(): Promise<string> {
    const { toPng } = await import("html-to-image");
    const node = exportRef.current;
    if (!node) throw new Error("no node");
    const opts = { pixelRatio: 2, cacheBust: false, imagePlaceholder: PLACEHOLDER, backgroundColor: "#0b0613" };
    try {
      return await toPng(node, opts);
    } catch {
      return await toPng(node, { ...opts, skipFonts: true });
    }
  }

  async function savePng() {
    setBusy("png");
    try {
      const url = await renderPng();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase}.png`;
      a.click();
      toast.success("Imagem da carteirinha salva!");
    } catch {
      toast.error("Não foi possível gerar a imagem agora.");
    } finally {
      setBusy(null);
    }
  }

  async function savePdf() {
    setBusy("pdf");
    try {
      const url = await renderPng();
      const { jsPDF } = await import("jspdf");
      const img = new Image();
      img.src = url;
      await img.decode();
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [img.width / 2, img.height / 2] });
      pdf.addImage(url, "PNG", 0, 0, img.width / 2, img.height / 2);
      pdf.save(`${fileBase}.pdf`);
      toast.success("PDF da carteirinha salvo!");
    } catch {
      toast.error("Não foi possível gerar o PDF agora.");
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    setBusy("share");
    const text = `Sou Associado ${formatMemberId(associate.member_number)} do Dante Clube, o clube de benefícios do Universo Querido Dante.`;
    try {
      if (navigator.share) {
        try {
          const blob = await (await fetch(await renderPng())).blob();
          const file = new File([blob], `${fileBase}.png`, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "Minha carteirinha Dante Clube", text });
            return;
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
        await navigator.share({ title: "Minha carteirinha Dante Clube", text, url: qrValue });
        return;
      }
      await navigator.clipboard.writeText(`${text} Validação: ${qrValue}`);
      toast.success("Link de validação copiado!", { description: "Cole onde quiser compartilhar." });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) toast.error("Não foi possível compartilhar agora.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="px-4 pt-8 md:px-6">
      <h1 className="font-display text-3xl font-semibold">Carteirinha</h1>
      <p className="mt-1 text-sm text-muted-foreground">Toque na carteirinha para ver o verso.</p>

      <div className="flip-scene mx-auto mt-6 max-w-md">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative block h-[460px] w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2rem]"
          aria-label={flipped ? "Ver frente da carteirinha" : "Ver verso da carteirinha com QR Code"}
        >
          <div className="flip-card relative h-full w-full" data-flipped={flipped}>
            <div className="flip-face absolute inset-0">
              <BadgeFront a={associate} avatarSrc={avatarSrc} />
            </div>
            <div className="flip-face flip-back absolute inset-0">
              <BadgeBack a={associate} qrValue={qrValue} />
            </div>
          </div>
        </button>
      </div>

      {avatars.length > 1 && (
        <div className="mx-auto mt-4 flex max-w-md justify-center">
          <Button variant="ghost" className="text-primary-glow hover:text-primary-glow" onClick={() => setPickerOpen(true)}>
            <Sparkles /> Trocar visual do Dante
          </Button>
        </div>
      )}

      <div className={avatars.length > 1 ? "mx-auto mt-2 grid max-w-md grid-cols-2 gap-3" : "mx-auto mt-6 grid max-w-md grid-cols-2 gap-3"}>
        <Button variant="soft" size="lg" onClick={share} disabled={busy !== null}>
          {busy === "share" ? <Loader2 className="animate-spin" /> : <Share2 />}
          Compartilhar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" disabled={busy !== null}>
              {busy === "png" || busy === "pdf" ? <Loader2 className="animate-spin" /> : <Download />}
              Salvar PDF / Imagem
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={savePdf}><FileText className="h-4 w-4" /> Salvar como PDF</DropdownMenuItem>
            <DropdownMenuItem onSelect={savePng}><FileImage className="h-4 w-4" /> Salvar como imagem</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mx-auto mt-5 max-w-md rounded-2xl bg-card/60 px-5 py-4 text-center text-sm text-muted-foreground">
        Esta carteirinha é válida como identificação do Associado Dante Clube.
      </p>

      <DanteAvatarPicker open={pickerOpen} onOpenChange={setPickerOpen} avatars={avatars} currentSrc={avatarSrc} />

      {/* Off-screen render of both sides, used for the image/PDF export. */}
      <div aria-hidden="true" className="pointer-events-none fixed -left-[10000px] top-0">
        <div ref={exportRef} className="flex w-[400px] flex-col gap-5 bg-background p-5">
          <div className="h-[460px]"><BadgeFront a={associate} avatarSrc={avatarSrc} /></div>
          <div className="h-[460px]"><BadgeBack a={associate} qrValue={qrValue} /></div>
        </div>
      </div>
    </div>
  );
}
