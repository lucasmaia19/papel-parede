import type {
  CidadeAtendida,
  FaixaFrete,
  Parede,
  PersonalizacaoEscolhida,
  Regiao,
  ServicosItem,
  Settings,
} from "@/types"

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 })

export function formatarMoeda(valor: number): string {
  return moeda.format(valor)
}

export function formatarNumero(valor: number): string {
  return numero.format(valor)
}

export function formatarM2(valor: number): string {
  return `${numero.format(valor)} m²`
}

/** Aceita "2,5", "2.5", " 2,50 m". Retorna null se não for um número válido. */
export function parseDecimal(valor: string): number | null {
  const limpo = valor.trim().replace(/[^\d.,-]/g, "")
  if (!limpo) return null
  // "1.234,5" → separador de milhar ponto e decimal vírgula
  const normalizado =
    limpo.includes(",") && limpo.includes(".")
      ? limpo.replace(/\./g, "").replace(",", ".")
      : limpo.replace(",", ".")
  if (!/^-?\d*\.?\d+$|^-?\d+\.?$/.test(normalizado)) return null
  const n = Number(normalizado)
  return Number.isFinite(n) ? n : null
}

export function arredondarDinheiro(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/** Arredonda para cima em centésimos, sem cair em erro de ponto flutuante (ex.: 13.2 não vira 13.21). */
export function arredondarAreaParaCima(area: number): number {
  return Math.ceil(Math.round(area * 1e6) / 1e4) / 100
}

function positivo(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0
}

export interface AreaParede {
  bruta: number
  aberturas: number
  liquida: number
}

export function calcularAreaParede(parede: Parede): AreaParede {
  const bruta = positivo(parede.largura) * positivo(parede.altura)
  const aberturas = parede.aberturas.reduce(
    (soma, a) => soma + positivo(a.largura) * positivo(a.altura),
    0,
  )
  return { bruta, aberturas: Math.min(aberturas, bruta), liquida: Math.max(0, bruta - aberturas) }
}

export interface Metragem {
  areaBruta: number
  areaAberturas: number
  /** Área real das paredes (sem portas e janelas) */
  areaLiquida: number
  /** Área extra pela margem de perda */
  areaPerda: number
  /** m² a cobrar: área líquida + perda, arredondada para cima */
  m2: number
}

export function calcularMetragem(paredes: Parede[], margemPerdaPct: number): Metragem {
  let areaBruta = 0
  let areaAberturas = 0
  let areaLiquida = 0
  for (const p of paredes) {
    const a = calcularAreaParede(p)
    areaBruta += a.bruta
    areaAberturas += a.aberturas
    areaLiquida += a.liquida
  }
  const m2 = arredondarAreaParaCima(areaLiquida * (1 + positivo(margemPerdaPct) / 100))
  return {
    areaBruta: arredondarAreaParaCima(areaBruta),
    areaAberturas: arredondarAreaParaCima(areaAberturas),
    areaLiquida: arredondarAreaParaCima(areaLiquida),
    areaPerda: arredondarAreaParaCima(Math.max(0, m2 - areaLiquida)),
    m2,
  }
}

export function precoM2ComAcrescimos(
  precoM2: number,
  personalizacoes: Pick<PersonalizacaoEscolhida, "acrescimoM2">[],
): number {
  return arredondarDinheiro(
    precoM2 + personalizacoes.reduce((soma, p) => soma + positivo(p.acrescimoM2), 0),
  )
}

export function calcularValorPapel(m2: number, precoM2: number): number {
  return arredondarDinheiro(positivo(m2) * positivo(precoM2))
}

/** A aplicação é cobrada pela área real da parede (sem a margem de perda). */
export function calcularAplicacao(m2Parede: number, valorAplicacaoM2: number): number {
  return arredondarDinheiro(positivo(m2Parede) * positivo(valorAplicacaoM2))
}

export interface ResultadoFrete {
  valor: number
  prazoDias: number
  gratis: boolean
}

export function calcularFrete(
  regiao: Regiao,
  tabela: FaixaFrete[],
  subtotalProdutos: number,
  freteGratisAcimaDe: number | null,
): ResultadoFrete | null {
  const faixa = tabela.find((f) => f.regiao === regiao)
  if (!faixa) return null
  const gratis = freteGratisAcimaDe !== null && freteGratisAcimaDe > 0 && subtotalProdutos >= freteGratisAcimaDe
  return { valor: gratis ? 0 : arredondarDinheiro(faixa.valor), prazoDias: faixa.prazoDias, gratis }
}

export function calcularDescontoPix(total: number, descontoPct: number) {
  const desconto = arredondarDinheiro(positivo(total) * (positivo(descontoPct) / 100))
  return { desconto, totalPix: arredondarDinheiro(positivo(total) - desconto) }
}

export type LocalEntrega =
  | { tipo: "atendida"; cidade: CidadeAtendida }
  | { tipo: "frete"; regiao: Regiao }
  | null

export interface ItemParaCalculo {
  /** m² cobrados (com perda) */
  m2: number
  /** m² da parede (sem perda) */
  m2Parede: number
  /** preço/m² já com acréscimos */
  precoM2: number
  servicos: ServicosItem
}

export interface ResumoPreco {
  papel: number
  /** Aplicação dos itens que pediram aplicação */
  aplicacao: number
  /** Aplicação caso fosse pedida em todos os itens (para o comparativo) */
  aplicacaoPossivel: number
  visita: number
  deslocamento: number
  frete: number
  freteGratis: boolean
  prazoFreteDias: number | null
  total: number
  descontoPix: number
  totalPix: number
  /** Só preenchidos em cidade atendida */
  totalSemAplicacao: number | null
  totalComAplicacao: number | null
}

/**
 * Resumo de preço para um item (página do produto) ou para o pedido todo (carrinho).
 * - Cidade atendida: aplicação por m² (se pedida), visita (uma vez por pedido) e deslocamento (uma vez).
 * - Fora da região: frete pela tabela (ou grátis acima do valor); sem aplicação nem visita.
 * - Sem CEP: só o papel.
 * O desconto Pix vale sobre o total.
 */
export function calcularResumo(
  itens: ItemParaCalculo[],
  local: LocalEntrega,
  settings: Pick<
    Settings,
    "valorAplicacaoM2" | "valorVisitaMedicao" | "descontoPix" | "tabelaFrete" | "freteGratisAcimaDe"
  >,
): ResumoPreco {
  const papel = arredondarDinheiro(
    itens.reduce((soma, i) => soma + calcularValorPapel(i.m2, i.precoM2), 0),
  )

  let aplicacao = 0
  let aplicacaoPossivel = 0
  let visita = 0
  let deslocamento = 0
  let frete = 0
  let freteGratis = false
  let prazoFreteDias: number | null = null

  if (local?.tipo === "atendida") {
    for (const i of itens) {
      const valor = calcularAplicacao(i.m2Parede, settings.valorAplicacaoM2)
      aplicacaoPossivel += valor
      if (i.servicos.aplicacao) aplicacao += valor
    }
    aplicacao = arredondarDinheiro(aplicacao)
    aplicacaoPossivel = arredondarDinheiro(aplicacaoPossivel)
    visita = itens.some((i) => i.servicos.visita) ? arredondarDinheiro(settings.valorVisitaMedicao) : 0
    deslocamento = itens.length > 0 ? arredondarDinheiro(local.cidade.taxaDeslocamento) : 0
  } else if (local?.tipo === "frete" && itens.length > 0) {
    const r = calcularFrete(local.regiao, settings.tabelaFrete, papel, settings.freteGratisAcimaDe)
    if (r) {
      frete = r.valor
      freteGratis = r.gratis
      prazoFreteDias = r.prazoDias
    }
  }

  const total = arredondarDinheiro(papel + aplicacao + visita + deslocamento + frete)
  const { desconto, totalPix } = calcularDescontoPix(total, settings.descontoPix)

  const atendida = local?.tipo === "atendida"
  return {
    papel,
    aplicacao,
    aplicacaoPossivel,
    visita,
    deslocamento,
    frete,
    freteGratis,
    prazoFreteDias,
    total,
    descontoPix: desconto,
    totalPix,
    totalSemAplicacao: atendida ? arredondarDinheiro(papel + visita + deslocamento) : null,
    totalComAplicacao: atendida
      ? arredondarDinheiro(papel + aplicacaoPossivel + visita + deslocamento)
      : null,
  }
}
