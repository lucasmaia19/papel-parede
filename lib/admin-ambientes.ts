import { slugificar } from "@/lib/admin-produto"
import { PARAMETROS_RESERVADOS } from "@/lib/ambientes"
import { gerarIdSimples } from "@/lib/id"
import type { Ambiente, GrupoAmbiente, OpcaoAmbiente } from "@/types"

export type ErrosAmbiente = Record<string, string>

export function ambienteVazio(): Ambiente {
  return { id: gerarIdSimples("amb"), nome: "", slug: "", imagem: "", ordem: 0, ativo: true, grupos: [] }
}

export function grupoVazio(): GrupoAmbiente {
  return { id: gerarIdSimples("ga"), pergunta: "", slug: "", multiplo: true, opcoes: [opcaoVazia()] }
}

export function opcaoVazia(): OpcaoAmbiente {
  return { id: gerarIdSimples("oa"), nome: "", slug: "" }
}

/** Slug único: acrescenta -2, -3… se já existir ou for reservado. */
function slugUnico(base: string, usados: Set<string>, padrao: string): string {
  const raiz = base || padrao
  let slug = raiz
  for (let n = 2; usados.has(slug); n++) slug = `${raiz}-${n}`
  usados.add(slug)
  return slug
}

/**
 * Valida e completa os slugs (endereço do filtro na URL). Slugs já existentes não mudam
 * quando o nome muda, para os links compartilhados continuarem funcionando.
 */
export function validarAmbiente(form: Ambiente, outros: Ambiente[]): { ambiente: Ambiente | null; erros: ErrosAmbiente } {
  const erros: ErrosAmbiente = {}
  const nome = form.nome.trim()
  if (nome.length < 2) erros.nome = "Digite o nome do ambiente. Exemplo: Quarto."

  const slugsAmbientes = new Set(outros.filter((a) => a.id !== form.id).map((a) => a.slug))
  const slug = form.slug || slugUnico(slugificar(nome), slugsAmbientes, "ambiente")

  const slugsGrupos = new Set<string>(PARAMETROS_RESERVADOS)
  const grupos = form.grupos.map((g, i): GrupoAmbiente => {
    const pergunta = g.pergunta.trim()
    if (!pergunta) erros[`grupos.${i}.pergunta`] = "Digite a pergunta. Exemplo: Para qual idade?"
    if (g.opcoes.length === 0) erros[`grupos.${i}.opcoes`] = "Adicione pelo menos uma opção."
    const slugsOpcoes = new Set<string>()
    const opcoes = g.opcoes.map((o, j) => {
      const nomeOpcao = o.nome.trim()
      if (!nomeOpcao) erros[`grupos.${i}.opcoes.${j}.nome`] = "Digite a opção. Exemplo: Infantil."
      const opcao: OpcaoAmbiente = {
        id: o.id,
        nome: nomeOpcao,
        slug: o.slug && !slugsOpcoes.has(o.slug) ? o.slug : slugUnico(slugificar(nomeOpcao), slugsOpcoes, "opcao"),
      }
      slugsOpcoes.add(opcao.slug)
      if (o.combinaComTodas) opcao.combinaComTodas = true
      return opcao
    })
    // "Para qual idade?" → "idade" (vira ?idade=… na URL)
    const base = slugificar(pergunta.replace(/^((para|qual|quais|que)\s+)+/i, ""))
    const slugGrupo = g.slug && !slugsGrupos.has(g.slug) ? g.slug : slugUnico(base, slugsGrupos, "pergunta")
    slugsGrupos.add(slugGrupo)
    return { id: g.id, pergunta, slug: slugGrupo, multiplo: g.multiplo, opcoes }
  })

  if (Object.keys(erros).length > 0) return { ambiente: null, erros }
  const ambiente: Ambiente = { id: form.id, nome, slug, imagem: form.imagem, ordem: form.ordem, ativo: form.ativo, grupos }
  const destaque = form.destaque?.trim()
  if (destaque) ambiente.destaque = destaque
  return { ambiente, erros }
}
