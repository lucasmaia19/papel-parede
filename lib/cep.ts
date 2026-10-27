import type { CidadeAtendida, Regiao } from "@/types"

/** Faixas oficiais (5 primeiros dígitos) → UF. Ordem importa só para faixas que se intercalam. */
const FAIXAS_UF: { inicio: number; fim: number; uf: string }[] = [
  { inicio: 1000, fim: 19999, uf: "SP" },
  { inicio: 20000, fim: 28999, uf: "RJ" },
  { inicio: 29000, fim: 29999, uf: "ES" },
  { inicio: 30000, fim: 39999, uf: "MG" },
  { inicio: 40000, fim: 48999, uf: "BA" },
  { inicio: 49000, fim: 49999, uf: "SE" },
  { inicio: 50000, fim: 56999, uf: "PE" },
  { inicio: 57000, fim: 57999, uf: "AL" },
  { inicio: 58000, fim: 58999, uf: "PB" },
  { inicio: 59000, fim: 59999, uf: "RN" },
  { inicio: 60000, fim: 63999, uf: "CE" },
  { inicio: 64000, fim: 64999, uf: "PI" },
  { inicio: 65000, fim: 65999, uf: "MA" },
  { inicio: 66000, fim: 68899, uf: "PA" },
  { inicio: 68900, fim: 68999, uf: "AP" },
  { inicio: 69000, fim: 69299, uf: "AM" },
  { inicio: 69300, fim: 69399, uf: "RR" },
  { inicio: 69400, fim: 69899, uf: "AM" },
  { inicio: 69900, fim: 69999, uf: "AC" },
  { inicio: 70000, fim: 72799, uf: "DF" },
  { inicio: 72800, fim: 72999, uf: "GO" },
  { inicio: 73000, fim: 73699, uf: "DF" },
  { inicio: 73700, fim: 76799, uf: "GO" },
  { inicio: 76800, fim: 76999, uf: "RO" },
  { inicio: 77000, fim: 77999, uf: "TO" },
  { inicio: 78000, fim: 78899, uf: "MT" },
  { inicio: 79000, fim: 79999, uf: "MS" },
  { inicio: 80000, fim: 87999, uf: "PR" },
  { inicio: 88000, fim: 89999, uf: "SC" },
  { inicio: 90000, fim: 99999, uf: "RS" },
]

const REGIAO_POR_UF: Record<string, Regiao> = {
  MG: "MG",
  SP: "Sudeste",
  RJ: "Sudeste",
  ES: "Sudeste",
  PR: "Sul",
  SC: "Sul",
  RS: "Sul",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  BA: "Nordeste",
  SE: "Nordeste",
  AL: "Nordeste",
  PE: "Nordeste",
  PB: "Nordeste",
  RN: "Nordeste",
  CE: "Nordeste",
  PI: "Nordeste",
  MA: "Nordeste",
  PA: "Norte",
  AP: "Norte",
  AM: "Norte",
  RR: "Norte",
  AC: "Norte",
  RO: "Norte",
  TO: "Norte",
}

export function somenteDigitosCep(cep: string): string {
  return cep.replace(/\D/g, "").slice(0, 8)
}

export function formatarCep(cep: string): string {
  const d = somenteDigitosCep(cep)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function cepValido(cep: string): boolean {
  return somenteDigitosCep(cep).length === 8
}

export function ufPorCep(cep: string): string | null {
  if (!cepValido(cep)) return null
  const prefixo = Number(somenteDigitosCep(cep).slice(0, 5))
  return FAIXAS_UF.find((f) => prefixo >= f.inicio && prefixo <= f.fim)?.uf ?? null
}

export function regiaoPorUF(uf: string): Regiao | null {
  return REGIAO_POR_UF[uf.toUpperCase()] ?? null
}

/** Cidade atendida cuja faixa de CEP contém o CEP. Se mais de uma servir, vence a faixa mais estreita. */
export function cidadeAtendidaPorCep(cep: string, cidades: CidadeAtendida[]): CidadeAtendida | null {
  if (!cepValido(cep)) return null
  const prefixo = Number(somenteDigitosCep(cep).slice(0, 5))
  let melhor: { cidade: CidadeAtendida; largura: number } | null = null
  for (const cidade of cidades) {
    for (const faixa of cidade.faixasCep) {
      const inicio = Number(faixa.inicio)
      const fim = Number(faixa.fim)
      if (prefixo >= inicio && prefixo <= fim) {
        const largura = fim - inicio
        if (!melhor || largura < melhor.largura) melhor = { cidade, largura }
      }
    }
  }
  return melhor?.cidade ?? null
}

export type ResultadoCep =
  | { tipo: "atendida"; cep: string; uf: string; regiao: Regiao; cidade: CidadeAtendida }
  | { tipo: "frete"; cep: string; uf: string; regiao: Regiao }

/** Consulta simulada: só usa as faixas de CEP, sem serviço externo. */
export function consultarCep(cep: string, cidades: CidadeAtendida[]): ResultadoCep | null {
  const uf = ufPorCep(cep)
  if (!uf) return null
  const regiao = regiaoPorUF(uf)
  if (!regiao) return null
  const formatado = formatarCep(cep)
  const cidade = cidadeAtendidaPorCep(cep, cidades)
  if (cidade) return { tipo: "atendida", cep: formatado, uf, regiao, cidade }
  return { tipo: "frete", cep: formatado, uf, regiao }
}
