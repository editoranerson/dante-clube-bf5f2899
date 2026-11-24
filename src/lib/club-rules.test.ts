import { describe, expect, it } from "vitest";
import { associateCouponState, parseCouponCodes } from "./coupons";
import { DANTE_AVATAR_URL, resolveDanteAvatar } from "./brand";

describe("cupons individuais", () => {
  it("lê um código por linha, sem repetidos e em maiúsculas", () => {
    expect(parseCouponCodes("abc1\nABC1\n\n  xyz2 ")).toEqual(["ABC1", "XYZ2"]);
  });
  it("cada Associado vê o próprio cupom depois de pegar", () => {
    expect(associateCouponState({ coupon_mode: "unique", coupon_code: null, my_coupon: "K9", coupons_left: 0 })).toEqual({ kind: "mine", code: "K9" });
  });
  it("mostra esgotado quando não sobra cupom no lote", () => {
    expect(associateCouponState({ coupon_mode: "unique", coupon_code: null, my_coupon: null, coupons_left: 0 }).kind).toBe("sold_out");
  });
});

describe("foto da carteirinha", () => {
  const avatars = [
    { id: "a", name: "Clássico", image_url: "/a.webp", is_default: true },
    { id: "b", name: "Espacial", image_url: "/b.webp", is_default: false },
  ];
  it("usa a pose escolhida pelo Associado", () => {
    expect(resolveDanteAvatar(avatars, "b")).toBe("/b.webp");
  });
  it("sem escolha, usa a pose padrão do ADMIN", () => {
    expect(resolveDanteAvatar(avatars, null)).toBe("/a.webp");
  });
  it("sem poses cadastradas, usa o Dante oficial (nunca iniciais)", () => {
    expect(resolveDanteAvatar([], null)).toBe(DANTE_AVATAR_URL);
  });
});
