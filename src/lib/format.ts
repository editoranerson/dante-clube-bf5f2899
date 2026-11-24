export const MEMBER_NUMBER_START = 100;

/** Matrícula do Associado: D-[sequencial], começando em D-100. */
export function formatMemberId(memberNumber: number): string {
  return `D-${memberNumber}`;
}

/** Normaliza o que o parceiro digitou ou escaneou (D-100, d100, 100, URL do QR ou código). */
export function normalizeValidationQuery(raw: string): string {
  let q = raw.trim().toUpperCase();
  if (q.includes("/")) q = q.replace(/\/+$/, "").split("/").pop() ?? "";
  const num = q.match(/^D-?(\d+)$/) ?? q.match(/^(\d+)$/);
  if (num?.[1]) return `D-${Number(num[1])}`;
  return q;
}

export function formatValidationCode(code: string, memberNumber: number): string {
  const c = code.replace(/^DC/, "");
  return `DC-${memberNumber}-${c.slice(0, 4)}-${c.slice(4)}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "D";
}

export type ActionType = "google_play" | "loja" | "endereco";

export function actionLabel(type: string): string {
  if (type === "google_play") return "Abrir no Google Play";
  if (type === "endereco") return "Ver Endereço";
  return "Ir para a Loja";
}

export function actionHref(offer: { action_type: string; action_url: string | null; address: string | null }): string | null {
  if (offer.action_type === "endereco") {
    if (!offer.address) return offer.action_url;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(offer.address)}`;
  }
  return offer.action_url || null;
}

export function normalizeText(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function filterOffers<T extends { title: string; description: string; store_name: string; category_id: string | null; discount_label: string }>(
  offers: T[],
  categoryId: string | null,
  search: string,
): T[] {
  const q = normalizeText(search.trim());
  return offers.filter((o) => {
    if (categoryId && o.category_id !== categoryId) return false;
    if (!q) return true;
    return normalizeText(`${o.title} ${o.description} ${o.store_name} ${o.discount_label}`).includes(q);
  });
}
