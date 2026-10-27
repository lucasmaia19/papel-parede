import type { ResultadoCep } from "@/lib/cep"
import { textoPersonalizacoes } from "@/lib/configurador"
import {
  arredondarDinheiro,
  calcularAplicacao,
  calcularValorPapel,
  formatarM2,
  formatarMoeda,
  formatarNumero,
  type LocalEntrega,
  type ResumoPreco,
} from "@/lib/pricing"
import type { CartItem, FormaPagamento, ItemPedido, Order, Settings } from "@/types"

export function localDoCep(resultado: ResultadoCep | null): LocalEntrega {
  if (!resultado) return null
  return resultado.tipo === "atendida"
    ? { tipo: "atendida", cidade: resultado.cidade }
    : { tipo: "frete", regiao: resultado.regiao }
}

export function itemParaCalculo(item: CartItem) {
  return { m2: item.m2, m2Parede: item.m2Parede, precoM2: item.precoM2, servicos: item.servicos }
}

/** Subtotal de cada item: papel + aplicação (só na região). */
export function montarItensPedido(
  itens: CartItem[],
  local: LocalEntrega,
  settings: Pick<Settings, "valorAplicacaoM2">,
): ItemPedido[] {
  const naRegiao = local?.tipo === "atendida"
  return itens.map((item) => {
    const subtotalPapel = calcularValorPapel(item.m2, item.precoM2)
    const subtotalAplicacao =
      naRegiao && item.servicos.aplicacao ? calcularAplicacao(item.m2Parede, settings.valorAplicacaoM2) : 0
    return {
      ...item,
      servicos: { aplicacao: naRegiao && item.servicos.aplicacao, visita: naRegiao && item.servicos.visita },
      subtotalPapel,
      subtotalAplicacao,
      subtotal: arredondarDinheiro(subtotalPapel + subtotalAplicacao),
    }
  })
}

export function textoParedes(item: Pick<CartItem, "paredes">): string {
  const partes = item.paredes.map((p) => `${formatarNumero(p.largura)} × ${formatarNumero(p.altura)} m`)
  const aberturas = item.paredes.flatMap((p) => p.aberturas)
  const portas = aberturas.filter((a) => a.tipo === "porta").length
  const janelas = aberturas.filter((a) => a.tipo === "janela").length
  const extras = [
    portas ? `${portas} ${portas === 1 ? "porta" : "portas"}` : "",
    janelas ? `${janelas} ${janelas === 1 ? "janela" : "janelas"}` : "",
  ].filter(Boolean)
  return `${partes.join(" + ")}${extras.length ? ` (menos ${extras.join(" e ")})` : ""}`
}

export interface PrazoEstimado {
  /** Dias úteis de produção (0 = pronta entrega) */
  producaoDias: number
  /** Dias úteis de transporte (null na região, onde a entrega é combinada) */
  entregaDias: number | null
  texto: string
}

export function calcularPrazo(itens: Pick<CartItem, "prontaEntrega" | "prazoProducaoDias">[], resumo: Pick<ResumoPreco, "prazoFreteDias">, naRegiao: boolean): PrazoEstimado {
  const producaoDias = itens.reduce((max, i) => Math.max(max, i.prontaEntrega ? 0 : i.prazoProducaoDias), 0)
  const entregaDias = naRegiao ? null : resumo.prazoFreteDias
  let texto: string
  if (naRegiao) {
    texto =
      producaoDias > 0
        ? `Produção em até ${producaoDias} dias úteis. Depois, combinamos com você o dia da entrega ou da aplicação.`
        : "Papel a pronta entrega. Combinamos com você o dia da entrega ou da aplicação."
  } else if (entregaDias !== null) {
    const total = producaoDias + entregaDias
    texto =
      producaoDias > 0
        ? `Até ${total} dias úteis: ${producaoDias} de produção + ${entregaDias} de transporte.`
        : `Até ${entregaDias} dias úteis (envio imediato).`
  } else {
    texto = producaoDias > 0 ? `Produção em até ${producaoDias} dias úteis + entrega.` : "Envio imediato."
  }
  return { producaoDias, entregaDias, texto }
}

export const ROTULO_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão de crédito",
  boleto: "Boleto",
  whatsapp: "A combinar pelo WhatsApp",
}

interface DadosMensagem {
  itens: ItemPedido[]
  resumo: ResumoPreco
  local: LocalEntrega
  cep: string
  uf?: string
  descontoPixPct: number
  nome?: string
  numeroPedido?: number
}

/** Orçamento completo formatado para o WhatsApp (o *texto* fica em negrito no app). */
export function mensagemOrcamento(d: DadosMensagem): string {
  const l: string[] = []
  l.push(d.numeroPedido ? `Olá! Quero finalizar o pedido nº ${d.numeroPedido}:` : "Olá! Quero finalizar este orçamento:")
  d.itens.forEach((item, i) => {
    l.push("")
    l.push(`*${i + 1}. ${item.produtoNome}*`)
    l.push(`Cor: ${item.cor.nome}`)
    if (item.personalizacoes.length) l.push(textoPersonalizacoes(item.personalizacoes))
    l.push(`Metragem: ${formatarM2(item.m2)} (paredes: ${textoParedes(item)})`)
    if (item.simulacao?.observacao) l.push(`Observação (simulação com IA): ${item.simulacao.observacao}`)
    if (item.simulacao?.imagem) l.push("Tem imagem de simulação com IA (envio aqui na conversa).")
    if (d.local?.tipo === "atendida") l.push(`Aplicação: ${item.servicos.aplicacao ? "sim" : "não"}`)
    l.push(`Subtotal: ${formatarMoeda(item.subtotal)}`)
  })
  l.push("")
  if (d.local?.tipo === "atendida") {
    l.push(`Cidade/CEP: ${d.local.cidade.nome} - ${d.cep}`)
    if (d.resumo.visita > 0) l.push(`Visita técnica: ${formatarMoeda(d.resumo.visita)}`)
    l.push(`Deslocamento: ${d.resumo.deslocamento > 0 ? formatarMoeda(d.resumo.deslocamento) : "grátis"}`)
  } else if (d.local?.tipo === "frete") {
    l.push(`CEP: ${d.cep}${d.uf ? ` (${d.uf})` : ""}`)
    l.push(
      `Frete (${d.local.regiao}): ${d.resumo.freteGratis ? "grátis" : formatarMoeda(d.resumo.frete)}${
        d.resumo.prazoFreteDias ? ` — até ${d.resumo.prazoFreteDias} dias úteis` : ""
      }`,
    )
  } else {
    l.push("Cidade/CEP: vou informar")
  }
  l.push("")
  l.push(`*Total: ${formatarMoeda(d.resumo.total)}*`)
  if (d.descontoPixPct > 0) l.push(`*No Pix: ${formatarMoeda(d.resumo.totalPix)}* (${formatarNumero(d.descontoPixPct)}% de desconto)`)
  if (d.nome) {
    l.push("")
    l.push(`Nome: ${d.nome}`)
  }
  return l.join("\n")
}

export function resumoDoPedido(pedido: Order): string {
  return `Olá! Acabei de fazer o pedido nº ${pedido.numero} no site (${formatarMoeda(pedido.total)}).`
}
