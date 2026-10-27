import { describe, expect, it } from "vitest"
import {
  arredondarAreaParaCima,
  calcularAplicacao,
  calcularAreaParede,
  calcularDescontoPix,
  calcularFrete,
  calcularMetragem,
  calcularResumo,
  calcularValorPapel,
  formatarMoeda,
  parseDecimal,
  precoM2ComAcrescimos,
  type ItemParaCalculo,
} from "@/lib/pricing"
import type { CidadeAtendida, FaixaFrete, Parede } from "@/types"

const tabelaFrete: FaixaFrete[] = [
  { regiao: "MG", valor: 30, prazoDias: 3 },
  { regiao: "Sudeste", valor: 45, prazoDias: 5 },
  { regiao: "Sul", valor: 60, prazoDias: 7 },
  { regiao: "Centro-Oeste", valor: 55, prazoDias: 6 },
  { regiao: "Nordeste", valor: 75, prazoDias: 9 },
  { regiao: "Norte", valor: 90, prazoDias: 12 },
]

const settings = {
  valorAplicacaoM2: 25,
  valorVisitaMedicao: 50,
  descontoPix: 5,
  tabelaFrete,
  freteGratisAcimaDe: 1000 as number | null,
}

const araguari: CidadeAtendida = {
  id: "araguari",
  nome: "Araguari",
  uf: "MG",
  taxaDeslocamento: 60,
  faixasCep: [{ inicio: "38440", fim: "38449" }],
}

function parede(largura: number, altura: number, aberturas: [number, number][] = []): Parede {
  return {
    id: `${largura}x${altura}`,
    largura,
    altura,
    aberturas: aberturas.map(([l, a], i) => ({ id: String(i), tipo: "janela", largura: l, altura: a })),
  }
}

function item(m2: number, m2Parede: number, servicos = { aplicacao: false, visita: false }): ItemParaCalculo {
  return { m2, m2Parede, precoM2: 80, servicos }
}

describe("parseDecimal", () => {
  it("aceita vírgula e ponto", () => {
    expect(parseDecimal("2,5")).toBe(2.5)
    expect(parseDecimal("2.5")).toBe(2.5)
    expect(parseDecimal(" 3 ")).toBe(3)
    expect(parseDecimal("2,60 m")).toBe(2.6)
    expect(parseDecimal("1.234,5")).toBe(1234.5)
  })
  it("rejeita texto inválido", () => {
    expect(parseDecimal("")).toBeNull()
    expect(parseDecimal("abc")).toBeNull()
    expect(parseDecimal("1,2,3")).toBeNull()
  })
})

describe("metragem", () => {
  it("soma várias paredes", () => {
    const m = calcularMetragem([parede(3, 2.6), parede(4, 2.6), parede(2.5, 2.6)], 0)
    // 7,8 + 10,4 + 6,5
    expect(m.areaLiquida).toBe(24.7)
    expect(m.m2).toBe(24.7)
  })

  it("desconta portas e janelas", () => {
    const p = parede(4, 2.5, [
      [0.8, 2.1], // porta 1,68
      [1.2, 1], // janela 1,2
    ])
    const a = calcularAreaParede(p)
    expect(a.bruta).toBe(10)
    expect(a.aberturas).toBeCloseTo(2.88)
    expect(a.liquida).toBeCloseTo(7.12)
  })

  it("aberturas maiores que a parede não deixam área negativa", () => {
    const a = calcularAreaParede(parede(1, 1, [[2, 2]]))
    expect(a.liquida).toBe(0)
    expect(a.aberturas).toBe(1)
  })

  it("aplica margem de perda e arredonda para cima", () => {
    const m = calcularMetragem([parede(3, 2.6)], 10)
    // 7,8 × 1,10 = 8,58
    expect(m.areaLiquida).toBe(7.8)
    expect(m.m2).toBe(8.58)
    expect(m.areaPerda).toBe(0.78)
    // 3,33 × 1,1 = 3,663 → 3,67
    expect(calcularMetragem([parede(3.33, 1)], 10).m2).toBe(3.67)
  })

  it("não cria centavo fantasma por ponto flutuante", () => {
    expect(arredondarAreaParaCima(13.2)).toBe(13.2)
    expect(arredondarAreaParaCima(0.1 + 0.2)).toBe(0.3)
  })

  it("ignora medidas vazias ou negativas", () => {
    expect(calcularMetragem([parede(Number.NaN, 2), parede(-3, 2)], 10).m2).toBe(0)
  })
})

describe("preço do papel", () => {
  it("m² × preço", () => {
    expect(calcularValorPapel(8.58, 80)).toBe(686.4)
  })

  it("soma acréscimos de personalização por m²", () => {
    const preco = precoM2ComAcrescimos(80, [{ acrescimoM2: 5 }, { acrescimoM2: 0 }, { acrescimoM2: 7.5 }])
    expect(preco).toBe(92.5)
    expect(calcularValorPapel(10, preco)).toBe(925)
  })
})

describe("aplicação", () => {
  it("cobra pela área real da parede (sem perda)", () => {
    expect(calcularAplicacao(7.8, 25)).toBe(195)
  })
})

describe("frete", () => {
  it("usa a tabela da região", () => {
    expect(calcularFrete("Sul", tabelaFrete, 500, 1000)).toEqual({ valor: 60, prazoDias: 7, gratis: false })
  })
  it("frete grátis acima do valor", () => {
    expect(calcularFrete("Norte", tabelaFrete, 1000, 1000)).toEqual({ valor: 0, prazoDias: 12, gratis: true })
  })
  it("sem frete grátis quando desligado", () => {
    expect(calcularFrete("Norte", tabelaFrete, 5000, null)?.valor).toBe(90)
  })
})

describe("desconto Pix", () => {
  it("aplica a porcentagem sobre o total", () => {
    expect(calcularDescontoPix(686.4, 5)).toEqual({ desconto: 34.32, totalPix: 652.08 })
  })
})

describe("resumo", () => {
  it("sem CEP: só o papel", () => {
    const r = calcularResumo([item(8.58, 7.8)], null, settings)
    expect(r.papel).toBe(686.4)
    expect(r.total).toBe(686.4)
    expect(r.totalSemAplicacao).toBeNull()
  })

  it("cidade atendida com aplicação, visita e deslocamento", () => {
    const r = calcularResumo(
      [item(8.58, 7.8, { aplicacao: true, visita: true })],
      { tipo: "atendida", cidade: araguari },
      settings,
    )
    expect(r.aplicacao).toBe(195)
    expect(r.visita).toBe(50)
    expect(r.deslocamento).toBe(60)
    expect(r.frete).toBe(0)
    expect(r.total).toBe(991.4)
    expect(r.totalPix).toBe(941.83)
    expect(r.totalSemAplicacao).toBe(796.4)
    expect(r.totalComAplicacao).toBe(991.4)
  })

  it("visita e deslocamento cobrados uma vez por pedido", () => {
    const r = calcularResumo(
      [item(5, 4, { aplicacao: true, visita: true }), item(5, 4, { aplicacao: false, visita: true })],
      { tipo: "atendida", cidade: araguari },
      settings,
    )
    expect(r.visita).toBe(50)
    expect(r.deslocamento).toBe(60)
    expect(r.aplicacao).toBe(100)
    expect(r.aplicacaoPossivel).toBe(200)
  })

  it("fora da região: frete, sem serviços", () => {
    const r = calcularResumo(
      [item(8.58, 7.8, { aplicacao: true, visita: true })],
      { tipo: "frete", regiao: "Nordeste" },
      settings,
    )
    expect(r.aplicacao).toBe(0)
    expect(r.visita).toBe(0)
    expect(r.frete).toBe(75)
    expect(r.prazoFreteDias).toBe(9)
    expect(r.total).toBe(761.4)
  })

  it("fora da região com frete grátis", () => {
    const r = calcularResumo([item(15, 13.6)], { tipo: "frete", regiao: "Sul" }, settings)
    expect(r.papel).toBe(1200)
    expect(r.frete).toBe(0)
    expect(r.freteGratis).toBe(true)
  })
})

describe("formatação", () => {
  it("formata em reais", () => {
    expect(formatarMoeda(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50")
  })
})
