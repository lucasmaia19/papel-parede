"use client"

import { InfoIcon, TruckIcon } from "lucide-react"
import { OpcaoBotao } from "@/components/opcao-botao"
import type { ResultadoCep } from "@/lib/cep"
import { formatarMoeda, type ResumoPreco } from "@/lib/pricing"
import { useLoja } from "@/lib/store"

export function AvisoForaDaRegiao() {
  const cidades = useLoja((s) => s.settings.cidadesAtendidas)
  return (
    <p className="flex gap-3 rounded-md border border-warning-border bg-warning-bg p-4">
      <InfoIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <span>
        Aplicação e visita técnica disponíveis apenas em {cidades[0]?.nome ?? "Uberlândia"} e região. Enviamos o
        papel com instruções de aplicação.
      </span>
    </p>
  )
}

/** Resultado do CEP fora da região: valor e prazo do frete. */
export function InfoFrete({ resultado, resumo }: { resultado: Extract<ResultadoCep, { tipo: "frete" }>; resumo: ResumoPreco }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 rounded-md border border-border bg-surface-raised p-4">
        <TruckIcon className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">
            Entrega para {resultado.uf}:{" "}
            {resumo.freteGratis ? <span className="text-success">Frete grátis</span> : formatarMoeda(resumo.frete)}
          </p>
          {resumo.prazoFreteDias !== null && (
            <p className="text-foreground-subtle">
              Chega em até {resumo.prazoFreteDias} dias úteis depois do envio.
            </p>
          )}
        </div>
      </div>
      <AvisoForaDaRegiao />
    </div>
  )
}

export interface EscolhaServicos {
  aplicacao: boolean | null
  visita: boolean | null
}

interface ServicosRegiaoProps {
  cidade: string
  escolha: EscolhaServicos
  onChange: (escolha: EscolhaServicos) => void
  valorAplicacao: number
  valorAplicacaoM2: number
  valorVisita: number
  deslocamento: number
}

/** Na cidade atendida: perguntas de aplicação e visita técnica, com os valores. */
export function ServicosRegiao({
  cidade,
  escolha,
  onChange,
  valorAplicacao,
  valorAplicacaoM2,
  valorVisita,
  deslocamento,
}: ServicosRegiaoProps) {
  return (
    <div data-slot="servicos-regiao" className="flex flex-col gap-6">
      <p className="rounded-md border border-primary/40 bg-primary-soft/60 p-4 font-semibold">
        Atendemos {cidade}!{" "}
        <span className="font-normal">
          {deslocamento > 0 ? `Taxa de deslocamento: ${formatarMoeda(deslocamento)}.` : "Sem taxa de deslocamento."}
        </span>
      </p>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">Quer que a gente aplique o papel?</legend>
        <p className="text-foreground-subtle">
          {formatarMoeda(valorAplicacaoM2)} por m²
          {valorAplicacao > 0 && <> — {formatarMoeda(valorAplicacao)} nesta parede</>}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <OpcaoBotao ativo={escolha.aplicacao === true} onClick={() => onChange({ ...escolha, aplicacao: true })}>
            Sim, quero
          </OpcaoBotao>
          <OpcaoBotao ativo={escolha.aplicacao === false} onClick={() => onChange({ ...escolha, aplicacao: false })}>
            Não, obrigado
          </OpcaoBotao>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">Quer visita técnica para conferir as medidas?</legend>
        <p className="text-foreground-subtle">
          {formatarMoeda(valorVisita)} — vamos até você e medimos tudo antes de produzir.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <OpcaoBotao ativo={escolha.visita === true} onClick={() => onChange({ ...escolha, visita: true })}>
            Sim, quero
          </OpcaoBotao>
          <OpcaoBotao ativo={escolha.visita === false} onClick={() => onChange({ ...escolha, visita: false })}>
            Não precisa
          </OpcaoBotao>
        </div>
      </fieldset>
    </div>
  )
}
