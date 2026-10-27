import type { MaterialProduto, Product } from "@/types"

// ⚠️ Preços fictícios: confirmar com a loja
export const MATERIAL_TEXTURIZADO: Omit<MaterialProduto, "precoM2"> = {
  id: "texturizado",
  nome: "Texturizado linho (não adesivo)",
  descricao: "Acabamento em textura de linho, aplicado com cola",
  ativo: true,
}

export const MATERIAL_ADESIVO: Omit<MaterialProduto, "precoM2"> = {
  id: "adesivo",
  nome: "Adesivo liso",
  descricao: "Liso, fácil de aplicar, só tirar o papel e colar",
  ativo: true,
}

/** Materiais padrão de uma estampa: os dois, no mesmo preço. Linho sem estampa: só o texturizado. */
export function materiaisPadrao(precoM2: number, somenteTexturizado = false): MaterialProduto[] {
  const lista = [{ ...MATERIAL_TEXTURIZADO, precoM2 }]
  if (!somenteTexturizado) lista.push({ ...MATERIAL_ADESIVO, precoM2 })
  return lista
}

export function materiaisAtivos(produto: Pick<Product, "materiais">): MaterialProduto[] {
  return (produto.materiais ?? []).filter((m) => m.ativo)
}

/** Menor preço/m² entre os materiais ativos (o "a partir de" dos cards). */
export function precoAPartirDe(produto: Pick<Product, "materiais" | "precoM2">): number {
  const precos = materiaisAtivos(produto).map((m) => m.precoM2)
  return precos.length ? Math.min(...precos) : produto.precoM2
}

/** Os preços dos materiais ativos são diferentes entre si? (para mostrar "a partir de") */
export function temPrecosDiferentes(produto: Pick<Product, "materiais">): boolean {
  return new Set(materiaisAtivos(produto).map((m) => m.precoM2)).size > 1
}

/** Garante materiais em produtos salvos antes de existir o campo (dados antigos do navegador). */
export function comMateriais(produto: Product): Product {
  if (Array.isArray(produto.materiais) && produto.materiais.length > 0) return produto
  const ehLinhoSemEstampa = produto.prontaEntrega && produto.categoria === "texturizado"
  return { ...produto, materiais: materiaisPadrao(produto.precoM2, ehLinhoSemEstampa) }
}
