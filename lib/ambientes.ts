import type { Ambiente, AmbienteProduto, GrupoAmbiente, Product } from "@/types"

/** Nomes de parâmetro da URL que as perguntas dos ambientes não podem usar */
export const PARAMETROS_RESERVADOS = ["ambiente", "categoria", "cor", "material"] as const

/** Ambiente e opções escolhidos no catálogo, por slug (como na URL) */
export interface FiltroAmbiente {
  ambiente: string | null
  /** slug da pergunta → slugs das opções marcadas */
  opcoes: Record<string, string[]>
}

export const SEM_AMBIENTE: FiltroAmbiente = { ambiente: null, opcoes: {} }

export function ambientesOrdenados(ambientes: Ambiente[]): Ambiente[] {
  return [...ambientes].sort((a, b) => a.ordem - b.ordem)
}

function marcacao(produto: Pick<Product, "ambientes">, ambienteId: string): AmbienteProduto | undefined {
  return (produto.ambientes ?? []).find((a) => a.ambienteId === ambienteId)
}

/**
 * O que o cliente pode escolher: ambientes ativos com pelo menos um papel, e só as opções
 * marcadas em algum papel (perguntas sem nenhuma opção usada somem).
 */
export function ambientesVisiveis(ambientes: Ambiente[], produtos: Pick<Product, "ambientes">[]): Ambiente[] {
  return ambientesOrdenados(ambientes).flatMap((a) => {
    if (!a.ativo) return []
    const marcacoes = produtos.flatMap((p) => marcacao(p, a.id) ?? [])
    if (marcacoes.length === 0) return []
    const usadas = new Set(marcacoes.flatMap((m) => m.opcoes))
    const grupos = a.grupos
      .map((g) => ({ ...g, opcoes: g.opcoes.filter((o) => usadas.has(o.id)) }))
      .filter((g) => g.opcoes.length > 0)
    return [{ ...a, grupos }]
  })
}

export interface ResultadoAmbiente {
  combina: boolean
  /** Entrou só por ter uma opção "combina com todas" (ex.: Neutro) em alguma pergunta */
  combinaComTodos: boolean
}

/**
 * Regras: opções da mesma pergunta valem como "ou"; perguntas diferentes, como "e".
 * Um papel com opção "combina com todas" (Neutro) passa em qualquer escolha daquela pergunta.
 */
export function avaliarProduto(
  produto: Pick<Product, "ambientes">,
  ambiente: Ambiente,
  escolhas: Record<string, string[]>,
): ResultadoAmbiente {
  const m = marcacao(produto, ambiente.id)
  if (!m) return { combina: false, combinaComTodos: false }
  let combinaComTodos = false
  for (const g of ambiente.grupos) {
    const escolhidas = new Set(escolhas[g.slug] ?? [])
    if (escolhidas.size === 0) continue
    const marcadas = g.opcoes.filter((o) => m.opcoes.includes(o.id))
    if (marcadas.some((o) => escolhidas.has(o.slug))) continue
    if (marcadas.some((o) => o.combinaComTodas)) {
      combinaComTodos = true
      continue
    }
    return { combina: false, combinaComTodos: false }
  }
  return { combina: true, combinaComTodos }
}

export interface ProdutoFiltrado<P> {
  produto: P
  combinaComTodos: boolean
}

export function filtrarPorAmbiente<P extends Pick<Product, "ambientes">>(
  produtos: P[],
  ambientes: Ambiente[],
  filtro: FiltroAmbiente,
): ProdutoFiltrado<P>[] {
  const ambiente = ambientes.find((a) => a.ativo && a.slug === filtro.ambiente)
  if (!ambiente) return produtos.map((produto) => ({ produto, combinaComTodos: false }))
  return produtos.flatMap((produto) => {
    const r = avaliarProduto(produto, ambiente, filtro.opcoes)
    return r.combina ? [{ produto, combinaComTodos: r.combinaComTodos }] : []
  })
}

/** Lê ?ambiente=quarto&idade=infantil&para-quem=menina,neutro (ignora o que não existe). */
export function lerFiltroAmbiente(params: Pick<URLSearchParams, "get">, ambientes: Ambiente[]): FiltroAmbiente {
  const ambiente = ambientes.find((a) => a.ativo && a.slug === params.get("ambiente"))
  if (!ambiente) return SEM_AMBIENTE
  const opcoes: Record<string, string[]> = {}
  for (const g of ambiente.grupos) {
    const validas = (params.get(g.slug) ?? "")
      .split(",")
      .filter((s) => g.opcoes.some((o) => o.slug === s))
    const lista = g.multiplo ? [...new Set(validas)] : validas.slice(0, 1)
    if (lista.length) opcoes[g.slug] = lista
  }
  return { ambiente: ambiente.slug, opcoes }
}

export function escreverFiltroAmbiente(busca: URLSearchParams, filtro: FiltroAmbiente) {
  if (!filtro.ambiente) return
  busca.set("ambiente", filtro.ambiente)
  for (const [grupo, lista] of Object.entries(filtro.opcoes)) {
    if (lista.length) busca.set(grupo, lista.join(","))
  }
}

/** Marca/desmarca uma opção (pergunta de escolha única troca a opção). */
export function alternarOpcao(filtro: FiltroAmbiente, grupo: GrupoAmbiente, opcaoSlug: string): FiltroAmbiente {
  const atual = filtro.opcoes[grupo.slug] ?? []
  const marcada = atual.includes(opcaoSlug)
  const proxima = marcada ? atual.filter((s) => s !== opcaoSlug) : grupo.multiplo ? [...atual, opcaoSlug] : [opcaoSlug]
  const opcoes = { ...filtro.opcoes, [grupo.slug]: proxima }
  if (proxima.length === 0) delete opcoes[grupo.slug]
  return { ...filtro, opcoes }
}

export function hrefAmbiente(ambiente: Pick<Ambiente, "slug">, grupo?: Pick<GrupoAmbiente, "slug">, opcaoSlug?: string): string {
  const busca = new URLSearchParams({ ambiente: ambiente.slug })
  if (grupo && opcaoSlug) busca.set(grupo.slug, opcaoSlug)
  return `/produtos?${busca.toString()}`
}

/** "Quarto (Infantil • Menina)" — o ambiente e as opções escolhidas, para mensagens. */
export function textoFiltroAmbiente(filtro: FiltroAmbiente, ambientes: Ambiente[]): string | null {
  const ambiente = ambientes.find((a) => a.slug === filtro.ambiente)
  if (!ambiente) return null
  const partes = ambiente.grupos.flatMap((g) => {
    const nomes = g.opcoes.filter((o) => filtro.opcoes[g.slug]?.includes(o.slug)).map((o) => o.nome)
    return nomes.length ? [nomes.join(", ")] : []
  })
  return partes.length ? `${ambiente.nome} (${partes.join(" • ")})` : ambiente.nome
}

export interface IndicacaoAmbiente {
  ambiente: Ambiente
  /** Opções marcadas, na ordem do cadastro, com a pergunta de cada uma */
  opcoes: { grupo: GrupoAmbiente; id: string; nome: string; slug: string }[]
}

/** Ambientes de um papel, na ordem do cadastro (ignora ambientes desativados ou excluídos). */
export function indicacoesProduto(produto: Pick<Product, "ambientes">, ambientes: Ambiente[], incluirInativos = false): IndicacaoAmbiente[] {
  return ambientesOrdenados(ambientes).flatMap((a) => {
    if (!a.ativo && !incluirInativos) return []
    const m = marcacao(produto, a.id)
    if (!m) return []
    const opcoes = a.grupos.flatMap((grupo) =>
      grupo.opcoes.filter((o) => m.opcoes.includes(o.id)).map((o) => ({ grupo, id: o.id, nome: o.nome, slug: o.slug })),
    )
    return [{ ambiente: a, opcoes }]
  })
}

/** "Quarto (Bebê, Infantil • Menina, Neutro), Brinquedoteca" */
export function resumoAmbientes(produto: Pick<Product, "ambientes">, ambientes: Ambiente[], incluirInativos = false): string {
  return indicacoesProduto(produto, ambientes, incluirInativos)
    .map(({ ambiente, opcoes }) => {
      const porGrupo = ambiente.grupos.flatMap((g) => {
        const nomes = opcoes.filter((o) => o.grupo.id === g.id).map((o) => o.nome)
        return nomes.length ? [nomes.join(", ")] : []
      })
      return porGrupo.length ? `${ambiente.nome} (${porGrupo.join(" • ")})` : ambiente.nome
    })
    .join(", ")
}

/** Quantos papéis usam o ambiente (ou uma opção dele). */
export function produtosQueUsam(produtos: Pick<Product, "ambientes">[], ambienteId: string, opcaoId?: string): number {
  return produtos.filter((p) => {
    const m = marcacao(p, ambienteId)
    return m && (!opcaoId || m.opcoes.includes(opcaoId))
  }).length
}

/** Tira dos papéis a referência ao ambiente excluído (ou só à opção). */
export function removerReferencia<P extends Pick<Product, "ambientes">>(produto: P, ambienteId: string, opcaoIds?: string[]): P {
  const lista = produto.ambientes ?? []
  if (!lista.some((a) => a.ambienteId === ambienteId)) return produto
  const ambientes = opcaoIds
    ? lista.map((a) => (a.ambienteId === ambienteId ? { ...a, opcoes: a.opcoes.filter((o) => !opcaoIds.includes(o)) } : a))
    : lista.filter((a) => a.ambienteId !== ambienteId)
  return { ...produto, ambientes }
}

// ——— Ordem aleatória estável ———

/** FNV-1a de 32 bits */
export function hashTexto(texto: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Gerador pseudoaleatório (mulberry32): mesma semente, mesma sequência */
export function criarSorteio(semente: number): () => number {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Embaralha pela semente da sessão. A posição de cada papel depende só dele e da semente,
 * então filtrar não faz os outros "pularem" de lugar entre si. Sem semente, mantém a ordem.
 */
export function ordenarComSemente<T>(lista: T[], semente: number | null, id: (item: T) => string): T[] {
  if (semente === null) return lista
  return lista
    .map((item) => ({ item, chave: hashTexto(`${semente}:${id(item)}`) }))
    .sort((a, b) => a.chave - b.chave)
    .map((x) => x.item)
}
