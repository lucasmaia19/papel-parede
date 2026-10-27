import { describe, expect, it } from "vitest"
import { consultarCep, formatarCep, regiaoPorUF, ufPorCep } from "@/lib/cep"
import { settingsIniciais } from "@/lib/data"

const cidades = settingsIniciais.cidadesAtendidas

describe("CEP", () => {
  it("formata", () => {
    expect(formatarCep("38408610")).toBe("38408-610")
  })

  it("mapeia UF e região", () => {
    expect(ufPorCep("01310-100")).toBe("SP")
    expect(ufPorCep("88010-000")).toBe("SC")
    expect(ufPorCep("69900-000")).toBe("AC")
    expect(regiaoPorUF("SP")).toBe("Sudeste")
    expect(regiaoPorUF("GO")).toBe("Centro-Oeste")
    expect(ufPorCep("123")).toBeNull()
  })

  it("Uberlândia é atendida sem deslocamento", () => {
    const r = consultarCep("38408-610", cidades)
    expect(r?.tipo).toBe("atendida")
    if (r?.tipo === "atendida") {
      expect(r.cidade.nome).toBe("Uberlândia")
      expect(r.cidade.taxaDeslocamento).toBe(0)
    }
  })

  it("Araguari (3844x) vence a faixa de Uberlândia (384xx)", () => {
    const r = consultarCep("38440-000", cidades)
    expect(r?.tipo === "atendida" && r.cidade.nome).toBe("Araguari")
  })

  it("Uberaba (380xx–381xx)", () => {
    const r = consultarCep("38100-000", cidades)
    expect(r?.tipo === "atendida" && r.cidade.nome).toBe("Uberaba")
  })

  it("outra cidade de MG paga frete da região MG", () => {
    const r = consultarCep("30140-000", cidades)
    expect(r).toMatchObject({ tipo: "frete", uf: "MG", regiao: "MG" })
  })
})
