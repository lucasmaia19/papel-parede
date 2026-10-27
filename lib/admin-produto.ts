import { gerarIdSimples } from "@/lib/id"
import { materiaisPadrao } from "@/lib/materiais"
import { normalizar } from "@/lib/catalogo"
import { parseDecimal } from "@/lib/pricing"
import type { Categoria, ImagemProduto, Product } from "@/types"

/** Produto como editado no formulário: números como texto (aceita vírgula). */
export interface ProdutoForm {
  id: string
  slug: string
  nome: string
  descricao: string
  categoria: Categoria
  imagens: ImagemProduto[]
  materiais: { id: string; nome: string; descricao: string; precoM2: string; ativo: boolean }[]
  prontaEntrega: boolean
  prazoProducaoDias: string
  ativo: boolean
  cores: { id: string; nome: string; hex: string; imagem?: string }[]
  gruposPersonalizacao: { id: string; nome: string; opcoes: { id: string; rotulo: string; acrescimoM2: string }[] }[]
  regua: { pixelsPorCm: string; medidas: { id: string; rotulo: string; larguraCm: string; alturaCm: string }[] }
  iaHabilitada: boolean
  sugestoesIA: string[]
}

export type ErrosProduto = Record<string, string>

const txt = (n: number | undefined) => (n === undefined || n === 0 ? "" : String(n).replace(".", ","))

export function slugificar(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export function produtoVazio(precoM2Padrao: number): ProdutoForm {
  return {
    id: gerarIdSimples("p"),
    slug: "",
    nome: "",
    descricao: "",
    categoria: "estampado",
    imagens: [],
    materiais: materiaisPadrao(precoM2Padrao).map((m) => ({ ...m, precoM2: txt(m.precoM2) })),
    prontaEntrega: false,
    prazoProducaoDias: "7",
    ativo: true,
    cores: [{ id: gerarIdSimples("c"), nome: "", hex: "#d9cbb4" }],
    gruposPersonalizacao: [],
    regua: { pixelsPorCm: "", medidas: [] },
    iaHabilitada: false,
    sugestoesIA: [],
  }
}

export function produtoParaForm(p: Product): ProdutoForm {
  return {
    ...p,
    imagens: [...p.imagens],
    materiais: p.materiais.map((m) => ({ ...m, precoM2: txt(m.precoM2) })),
    prazoProducaoDias: String(p.prazoProducaoDias),
    cores: p.cores.map((c) => ({ ...c })),
    gruposPersonalizacao: p.gruposPersonalizacao.map((g) => ({
      ...g,
      opcoes: g.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo, acrescimoM2: txt(o.acrescimoM2) })),
    })),
    regua: {
      pixelsPorCm: p.regua ? txt(Math.round(p.regua.pixelsPorCm * 1000) / 1000) : "",
      medidas: (p.regua?.medidas ?? []).map((m) => ({
        id: m.id,
        rotulo: m.rotulo,
        larguraCm: txt(m.larguraCm),
        alturaCm: txt(m.alturaCm),
      })),
    },
    sugestoesIA: [...p.sugestoesIA],
  }
}

function numero(texto: string): number | null {
  return texto.trim() === "" ? null : parseDecimal(texto)
}

/**
 * Valida e converte. Os erros usam chaves estáveis (ex.: "cores.2.nome") para
 * o formulário mostrar a mensagem ao lado do campo.
 */
export function validarProduto(
  form: ProdutoForm,
  outros: Pick<Product, "id" | "slug">[],
): { produto: Product | null; erros: ErrosProduto } {
  const erros: ErrosProduto = {}

  const nome = form.nome.trim()
  if (nome.length < 2) erros.nome = "Digite o nome do papel de parede."

  const slug = slugificar(form.slug || nome)
  if (!slug) erros.slug = "O endereço da página não pode ficar vazio."
  else if (outros.some((p) => p.id !== form.id && p.slug === slug))
    erros.slug = "Já existe outro papel com esse endereço. Mude o nome ou o endereço."

  if (!form.materiais.some((m) => m.ativo)) erros.materiais = "Deixe pelo menos um material ativo."
  const materiais = form.materiais.map((m, i) => {
    if (!m.nome.trim()) erros[`materiais.${i}.nome`] = "Digite o nome do material."
    const preco = numero(m.precoM2)
    if (preco === null || preco <= 0) erros[`materiais.${i}.preco`] = "Digite o preço por m². Exemplo: 80"
    return { id: m.id, nome: m.nome.trim(), descricao: m.descricao.trim(), precoM2: preco ?? 0, ativo: m.ativo }
  })
  const precosAtivos = materiais.filter((m) => m.ativo).map((m) => m.precoM2)

  const prazo = numero(form.prazoProducaoDias)
  if (!form.prontaEntrega && (prazo === null || prazo < 0 || !Number.isInteger(prazo)))
    erros.prazoProducaoDias = "Digite o prazo em dias úteis (número inteiro)."

  if (form.imagens.length === 0) erros.imagens = "Envie pelo menos uma foto."

  if (form.cores.length === 0) erros.cores = "Cadastre pelo menos uma cor."
  form.cores.forEach((c, i) => {
    if (!c.nome.trim()) erros[`cores.${i}.nome`] = "Digite o nome da cor."
  })

  form.gruposPersonalizacao.forEach((g, i) => {
    if (!g.nome.trim()) erros[`grupos.${i}.nome`] = "Digite o nome do grupo (ex.: Tamanho da estampa)."
    if (g.opcoes.length === 0) erros[`grupos.${i}.opcoes`] = "Adicione pelo menos uma opção."
    g.opcoes.forEach((o, j) => {
      if (!o.rotulo.trim()) erros[`grupos.${i}.opcoes.${j}.rotulo`] = "Digite a opção."
      const a = numero(o.acrescimoM2)
      if (o.acrescimoM2.trim() && (a === null || a < 0)) erros[`grupos.${i}.opcoes.${j}.acrescimo`] = "Valor inválido."
    })
  })

  const pxCm = numero(form.regua.pixelsPorCm)
  if (form.regua.pixelsPorCm.trim() && (pxCm === null || pxCm <= 0))
    erros["regua.pixelsPorCm"] = "Valor inválido. Use a calibração por clique."
  form.regua.medidas.forEach((m, i) => {
    if (!m.rotulo.trim()) erros[`medidas.${i}.rotulo`] = "Digite o nome (ex.: Cada quadrado)."
    const l = numero(m.larguraCm)
    if (l === null || l <= 0) erros[`medidas.${i}.largura`] = "Digite a largura em cm."
    const a = numero(m.alturaCm)
    if (m.alturaCm.trim() && (a === null || a < 0)) erros[`medidas.${i}.altura`] = "Valor inválido."
  })
  if (form.regua.medidas.length > 0 && !pxCm) erros["regua.pixelsPorCm"] = "Calibre a régua para mostrar as medidas."

  if (Object.keys(erros).length > 0) return { produto: null, erros }

  return {
    produto: {
      id: form.id,
      slug,
      nome,
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      imagens: form.imagens,
      precoM2: Math.min(...precosAtivos),
      materiais,
      prontaEntrega: form.prontaEntrega,
      prazoProducaoDias: form.prontaEntrega ? 0 : prazo!,
      ativo: form.ativo,
      cores: form.cores.map((c) => ({ ...c, nome: c.nome.trim() })),
      gruposPersonalizacao: form.gruposPersonalizacao.map((g) => ({
        id: g.id,
        nome: g.nome.trim(),
        opcoes: g.opcoes.map((o) => {
          const a = numero(o.acrescimoM2)
          return { id: o.id, rotulo: o.rotulo.trim(), ...(a ? { acrescimoM2: a } : {}) }
        }),
      })),
      regua: pxCm
        ? {
            pixelsPorCm: pxCm,
            medidas: form.regua.medidas.map((m) => ({
              id: m.id,
              rotulo: m.rotulo.trim(),
              larguraCm: numero(m.larguraCm)!,
              alturaCm: numero(m.alturaCm) ?? 0,
            })),
          }
        : null,
      iaHabilitada: form.iaHabilitada,
      sugestoesIA: form.sugestoesIA.map((s) => s.trim()).filter(Boolean),
    },
    erros,
  }
}

/** px por cm a partir de dois cliques na foto (coordenadas na imagem em tamanho natural). */
export function calcularPixelsPorCm(
  a: { x: number; y: number },
  b: { x: number; y: number },
  distanciaCm: number,
): number | null {
  const px = Math.hypot(b.x - a.x, b.y - a.y)
  if (!(distanciaCm > 0) || px < 1) return null
  return px / distanciaCm
}

export function moverItem<T>(lista: T[], indice: number, direcao: -1 | 1): T[] {
  const destino = indice + direcao
  if (destino < 0 || destino >= lista.length) return lista
  const nova = [...lista]
  ;[nova[indice], nova[destino]] = [nova[destino], nova[indice]]
  return nova
}
