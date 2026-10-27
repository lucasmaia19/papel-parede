import { gerarIdSimples } from "@/lib/id"
import { formatarM2, formatarMoeda, parseDecimal } from "@/lib/pricing"
import type { Abertura, Parede, PersonalizacaoEscolhida, Product, TipoAbertura } from "@/types"

/** Parede como o cliente digita (texto), antes de virar número. */
export interface AberturaForm {
  id: string
  tipo: TipoAbertura
  largura: string
  altura: string
}

export interface ParedeForm {
  id: string
  largura: string
  altura: string
  aberturas: AberturaForm[]
}

export const MEDIDAS_PADRAO_ABERTURA: Record<TipoAbertura, { largura: string; altura: string }> = {
  porta: { largura: "0,80", altura: "2,10" },
  janela: { largura: "1,20", altura: "1,00" },
}

export function novaParede(): ParedeForm {
  return { id: gerarIdSimples("w"), largura: "", altura: "", aberturas: [] }
}

/**
 * Primeira parede com id fixo: roda na pré-renderização, onde Date.now()/Math.random()
 * tirariam a página do HTML estático (Cache Components).
 */
export function paredeInicial(): ParedeForm {
  return { id: "parede-1", largura: "", altura: "", aberturas: [] }
}

export function novaAbertura(tipo: TipoAbertura): AberturaForm {
  return { id: gerarIdSimples("a"), tipo, ...MEDIDAS_PADRAO_ABERTURA[tipo] }
}

function numeroOuZero(texto: string): number {
  const n = parseDecimal(texto)
  return n !== null && n > 0 ? n : 0
}

export function paredeFormParaParede(p: ParedeForm): Parede {
  return {
    id: p.id,
    largura: numeroOuZero(p.largura),
    altura: numeroOuZero(p.altura),
    aberturas: p.aberturas.map(
      (a): Abertura => ({ id: a.id, tipo: a.tipo, largura: numeroOuZero(a.largura), altura: numeroOuZero(a.altura) }),
    ),
  }
}

export function paredeParaForm(p: Parede): ParedeForm {
  const txt = (n: number) => (n > 0 ? String(n).replace(".", ",") : "")
  return {
    id: p.id,
    largura: txt(p.largura),
    altura: txt(p.altura),
    aberturas: p.aberturas.map((a) => ({ id: a.id, tipo: a.tipo, largura: txt(a.largura), altura: txt(a.altura) })),
  }
}

/** Mensagem de erro do campo de medida, ou null se ok/vazio. */
export function validarMedida(texto: string, max = 30): string | null {
  if (!texto.trim()) return null
  const n = parseDecimal(texto)
  if (n === null) return "Digite só números. Exemplo: 2,60"
  if (n <= 0) return "A medida precisa ser maior que zero."
  if (n > max) return `Confira: ${texto} metros parece muito. Use metros (ex.: 2,60), não centímetros.`
  return null
}

/** Por padrão escolhe, em cada grupo, a primeira opção sem acréscimo (o tamanho "normal"). */
export function opcoesPadrao(produto: Product): Record<string, string> {
  const escolhas: Record<string, string> = {}
  for (const g of produto.gruposPersonalizacao) {
    const semAcrescimo = g.opcoes.find((o) => !o.acrescimoM2)
    const opcao = semAcrescimo ?? g.opcoes[0]
    if (opcao) escolhas[g.id] = opcao.id
  }
  return escolhas
}

export function personalizacoesEscolhidas(
  produto: Product,
  escolhas: Record<string, string>,
): PersonalizacaoEscolhida[] {
  return produto.gruposPersonalizacao.flatMap((g) => {
    const opcao = g.opcoes.find((o) => o.id === escolhas[g.id])
    return opcao ? [{ grupo: g.nome, opcao: opcao.rotulo, acrescimoM2: opcao.acrescimoM2 ?? 0 }] : []
  })
}

export function textoPersonalizacoes(lista: PersonalizacaoEscolhida[]): string {
  return lista.map((p) => `${p.grupo}: ${p.opcao}`).join(" • ")
}

export function mensagemDuvidaProduto(args: {
  produto: Product
  cor: string
  personalizacoes: PersonalizacaoEscolhida[]
  m2: number
  url?: string
}): string {
  const linhas = [
    `Olá! Tenho uma dúvida sobre o papel de parede *${args.produto.nome}*.`,
    `Cor: ${args.cor}`,
    ...args.personalizacoes.map((p) => `${p.grupo}: ${p.opcao}`),
    args.m2 > 0 ? `Metragem: ${formatarM2(args.m2)}` : "Ainda não calculei a metragem.",
    `Preço: ${formatarMoeda(args.produto.precoM2)}/m²`,
  ]
  if (args.url) linhas.push(args.url)
  return linhas.join("\n")
}
