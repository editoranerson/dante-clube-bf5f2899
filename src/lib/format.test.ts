import { describe, expect, it } from "vitest";
import { MEMBER_NUMBER_START, filterOffers, formatMemberId, normalizeValidationQuery } from "./format";

describe("matrícula do Associado", () => {
  it("começa em D-100", () => {
    expect(formatMemberId(MEMBER_NUMBER_START)).toBe("D-100");
  });
  it("segue o sequencial no formato D-[número]", () => {
    expect(formatMemberId(101)).toBe("D-101");
  });
});

describe("validador do parceiro", () => {
  it("aceita o ID digitado sem hífen ou em minúsculas", () => {
    expect(normalizeValidationQuery(" d100 ")).toBe("D-100");
  });
  it("extrai o código de validação da URL do QR Code", () => {
    expect(normalizeValidationQuery("https://clube.app/validar/dcab12cd34")).toBe("DCAB12CD34");
  });
});

describe("busca de benefícios", () => {
  const offers = [
    { title: "E-books", description: "", store_name: "Dante", category_id: "ebooks", discount_label: "30% OFF" },
    { title: "Café grátis", description: "", store_name: "Café Constelação", category_id: "presencial", discount_label: "" },
  ];
  it("filtra pela categoria escolhida", () => {
    expect(filterOffers(offers, "presencial", "")).toHaveLength(1);
  });
  it("busca sem diferenciar acentos", () => {
    expect(filterOffers(offers, null, "cafe")[0]?.title).toBe("Café grátis");
  });
});
