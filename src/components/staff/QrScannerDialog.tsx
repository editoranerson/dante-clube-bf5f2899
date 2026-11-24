import { useEffect, useRef, useState } from "react";
import { CameraOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function QrScannerDialog({ open, onOpenChange, onResult }: { open: boolean; onOpenChange: (o: boolean) => void; onResult: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"starting" | "scanning" | "error">("starting");

  useEffect(() => {
    if (!open) return;
    let scanner: { stop: () => void; destroy: () => void } | null = null;
    let cancelled = false;
    setState("starting");
    (async () => {
      try {
        const { default: QrScanner } = await import("qr-scanner");
        if (cancelled || !videoRef.current) return;
        const s = new QrScanner(
          videoRef.current,
          (result) => {
            s.stop();
            onResult(result.data);
            onOpenChange(false);
          },
          { preferredCamera: "environment", highlightScanRegion: true, highlightCodeOutline: true, returnDetailedScanResult: true },
        );
        scanner = s;
        await s.start();
        if (!cancelled) setState("scanning");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, [open, onOpenChange, onResult]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display">Escanear QR Code</DialogTitle>
          <DialogDescription>Aponte a câmera para o verso da carteirinha do Associado.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          {state === "starting" && (
            <div className="absolute inset-0 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
          )}
          {state === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <CameraOff className="h-8 w-8" />
              Não foi possível abrir a câmera. Permita o acesso à câmera ou digite o ID do Associado.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
