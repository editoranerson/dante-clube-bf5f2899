export type CouponMode = "single" | "unique";

export const MAX_COUPON_CODE_LENGTH = 60;

/** Lê os códigos colados pelo ADMIN/parceiro: um por linha (ou separados por vírgula/ponto e vírgula), sem repetidos. */
export function parseCouponCodes(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(/[\n\r,;\t]+/)) {
    const code = part.trim().toUpperCase();
    if (code && code.length <= MAX_COUPON_CODE_LENGTH) seen.add(code);
  }
  return [...seen];
}

export type AssociateCouponState =
  | { kind: "none" }
  | { kind: "shared"; code: string }
  | { kind: "mine"; code: string }
  | { kind: "available"; left: number }
  | { kind: "sold_out" };

/** O que o Associado vê no card da oferta. */
export function associateCouponState(o: {
  coupon_mode: string;
  coupon_code: string | null;
  my_coupon: string | null;
  coupons_left: number;
}): AssociateCouponState {
  if (o.coupon_mode === "unique") {
    if (o.my_coupon) return { kind: "mine", code: o.my_coupon };
    return o.coupons_left > 0 ? { kind: "available", left: o.coupons_left } : { kind: "sold_out" };
  }
  return o.coupon_code ? { kind: "shared", code: o.coupon_code } : { kind: "none" };
}
