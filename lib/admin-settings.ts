import { gerarIdSimples } from "@/lib/id"
import { parseDecimal } from "@/lib/pricing"
import type { Regiao, Settings } from "@/types"

const txt = (n: number) => String(n).replace(".", ",")

export interface SettingsForm {
  precoM2Padrao: string
  valorAplicacaoM2: string
  valorVisitaMedicao: string
  margemPerda: string
  descontoPix: string
  cidadesAtendidas: { id: string; nome: string; uf: string; taxaDeslocamento: string; faixasCep: { inicio: string; fim: string }[] }[]
  tabelaFrete: { regiao: Regiao; valor: string; prazoDias: string }[]
  freteGratisLigado: boolean
  freteGratisAcimaDe: string
  whatsapp: string
  instagram: string
  endereco: string
  textoAtendimento: string
}

export function settingsParaForm(s: Settings): SettingsForm {
  return {
    precoM2Padrao: txt(s.precoM2Padrao),
    valorAplicacaoM2: txt(s.valorAplicacaoM2),
    valorVisitaMedicao: txt(s.valorVisitaMedicao),
    margemPerda: txt(s.margemPerda),
    descontoPix: txt(s.descontoPix),
    cidadesAtendidas: s.cidadesAtendidas.map((c) => ({ ...c, taxaDeslocamento: txt(c.taxaDeslocamento), faixasCep: c.faixasCep.map((f) => ({ ...f })) })),
    tabelaFrete: s.tabelaFrete.map((f) => ({ regiao: f.regiao, valor: txt(f.valor), prazoDias: String(f.prazoDias) })),
    freteGratisLigado: s.freteGratisAcimaDe !== null,
    freteGratisAcimaDe: s.freteGratisAcimaDe !== null ? txt(s.freteGratisAcimaDe) : "1000",
    whatsapp: s.whatsapp,
    instagram: s.instagram,
    endereco: s.endereco,
    textoAtendimento: s.textoAtendimento,
  }
}

export function novaCidade() {
  return { id: gerarIdSimples("cid"), nome: "", uf: "MG", taxaDeslocamento: "0", faixasCep: [{ inicio: "", fim: "" }] }
}

export type ErrosSettings = Record<string, string>

export function validarSettings(f: SettingsForm): { settings: Settings | null; erros: ErrosSettings } {
  const erros: ErrosSettings = {}
  const valor = (chave: string, texto: string, { min = 0, max = Infinity, inteiro = false } = {}) => {
    const n = parseDecimal(texto)
    if (n === null || n < min || n > max || (inteiro && !Number.isInteger(n))) {
      erros[chave] = inteiro ? "Digite um número inteiro." : max === 100 ? "Digite uma porcentagem de 0 a 100." : "Digite um valor válido."
      return 0
    }
    return n
  }

  const precoM2Padrao = valor("precoM2Padrao", f.precoM2Padrao, { min: 0.01 })
  const valorAplicacaoM2 = valor("valorAplicacaoM2", f.valorAplicacaoM2)
  const valorVisitaMedicao = valor("valorVisitaMedicao", f.valorVisitaMedicao)
  const margemPerda = valor("margemPerda", f.margemPerda, { max: 100 })
  const descontoPix = valor("descontoPix", f.descontoPix, { max: 100 })

  if (f.cidadesAtendidas.length === 0) erros.cidades = "Cadastre pelo menos uma cidade atendida."
  const cidadesAtendidas = f.cidadesAtendidas.map((c, i) => {
    if (!c.nome.trim()) erros[`cidades.${i}.nome`] = "Digite o nome da cidade."
    if (!/^[A-Za-z]{2}$/.test(c.uf.trim())) erros[`cidades.${i}.uf`] = "UF com 2 letras."
    const taxa = valor(`cidades.${i}.taxa`, c.taxaDeslocamento)
    const faixas = c.faixasCep.filter((fx) => fx.inicio.trim() || fx.fim.trim())
    if (faixas.length === 0) erros[`cidades.${i}.faixas`] = "Informe a faixa de CEP (5 primeiros números)."
    faixas.forEach((fx, j) => {
      if (!/^\d{5}$/.test(fx.inicio) || !/^\d{5}$/.test(fx.fim) || Number(fx.inicio) > Number(fx.fim))
        erros[`cidades.${i}.faixas.${j}`] = "Use os 5 primeiros números do CEP. Ex.: de 38400 até 38499."
    })
    return {
      id: c.id,
      nome: c.nome.trim(),
      uf: c.uf.trim().toUpperCase(),
      taxaDeslocamento: taxa,
      faixasCep: faixas.map((fx) => ({ inicio: fx.inicio, fim: fx.fim })),
    }
  })

  const tabelaFrete = f.tabelaFrete.map((t) => ({
    regiao: t.regiao,
    valor: valor(`frete.${t.regiao}.valor`, t.valor),
    prazoDias: valor(`frete.${t.regiao}.prazo`, t.prazoDias, { min: 1, inteiro: true }),
  }))

  const freteGratisAcimaDe = f.freteGratisLigado ? valor("freteGratisAcimaDe", f.freteGratisAcimaDe, { min: 0.01 }) : null

  const whatsapp = f.whatsapp.replace(/\D/g, "")
  if (whatsapp.length < 12 || whatsapp.length > 13) erros.whatsapp = "Digite com 55 + DDD + número. Ex.: 5534996804044"
  if (!/^https:\/\/(www\.)?instagram\.com\/[^/\s]+\/?$/.test(f.instagram.trim()))
    erros.instagram = "Cole o endereço do perfil. Ex.: https://www.instagram.com/rodovalhopapeisdeparede/"
  if (!f.endereco.trim()) erros.endereco = "Digite o endereço da loja."
  if (!f.textoAtendimento.trim()) erros.textoAtendimento = "Digite o texto de atendimento."

  if (Object.keys(erros).length) return { settings: null, erros }
  return {
    settings: {
      precoM2Padrao,
      valorAplicacaoM2,
      valorVisitaMedicao,
      margemPerda,
      descontoPix,
      cidadesAtendidas,
      tabelaFrete,
      freteGratisAcimaDe,
      whatsapp,
      instagram: f.instagram.trim(),
      endereco: f.endereco.trim(),
      textoAtendimento: f.textoAtendimento.trim(),
    },
    erros,
  }
}
