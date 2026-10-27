import { CATEGORIAS, type Categoria, type Product } from "@/types"

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

export interface CorFiltro {
  chave: string
  nome: string
  hex: string
}

/** Cores de todos os produtos, sem repetir nomes (ex.: "Azul" de vários produtos vira um filtro só). */
export function coresDisponiveis(produtos: Product[]): CorFiltro[] {
  const mapa = new Map<string, CorFiltro>()
  for (const p of produtos) {
    for (const c of p.cores) {
      const chave = normalizar(c.nome)
      if (!mapa.has(chave)) mapa.set(chave, { chave, nome: c.nome, hex: c.hex })
    }
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
}

export interface MaterialFiltro {
  id: string
  nome: string
}

/** Materiais ativos de todos os produtos, sem repetir (o id identifica o material). */
export function materiaisDisponiveis(produtos: Product[]): MaterialFiltro[] {
  const mapa = new Map<string, MaterialFiltro>()
  for (const p of produtos) {
    for (const m of p.materiais ?? []) {
      if (m.ativo && !mapa.has(m.id)) mapa.set(m.id, { id: m.id, nome: m.nome })
    }
  }
  return [...mapa.values()]
}

export function categoriasDisponiveis(produtos: Product[]): Categoria[] {
  const usadas = new Set(produtos.map((p) => p.categoria))
  return CATEGORIAS.filter((c) => usadas.has(c))
}

export function filtrarProdutos(
  produtos: Product[],
  filtros: { categoria?: Categoria | null; cor?: string | null; material?: string | null; busca?: string },
): Product[] {
  const busca = filtros.busca ? normalizar(filtros.busca) : ""
  return produtos.filter((p) => {
    if (filtros.categoria && p.categoria !== filtros.categoria) return false
    if (filtros.cor && !p.cores.some((c) => normalizar(c.nome) === filtros.cor)) return false
    if (filtros.material && !(p.materiais ?? []).some((m) => m.ativo && m.id === filtros.material)) return false
    if (busca && !normalizar(`${p.nome} ${p.descricao}`).includes(busca)) return false
    return true
  })
}

export function ehCategoria(valor: string | null): valor is Categoria {
  return valor !== null && (CATEGORIAS as readonly string[]).includes(valor)
}

export function imagemPrincipal(produto: Product): string {
  return produto.imagens[0]?.url ?? produto.cores[0]?.imagem ?? "/img/produtos/linho-texturizado-off-white.webp"
}

export function textoPrazo(produto: Pick<Product, "prontaEntrega" | "prazoProducaoDias">): string {
  return produto.prontaEntrega
    ? "Pronta entrega — envio imediato"
    : `Produção em ${produto.prazoProducaoDias} ${produto.prazoProducaoDias === 1 ? "dia útil" : "dias úteis"} + entrega`
}
