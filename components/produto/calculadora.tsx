"use client"

import { useId } from "react"
import { DoorClosedIcon, PlusIcon, SquareIcon, Trash2Icon } from "lucide-react"
import { DesenhoParede } from "@/components/produto/desenho-parede"
import { GuiaMedir } from "@/components/produto/guia-medir"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  novaAbertura,
  novaParede,
  paredeFormParaParede,
  validarMedida,
  type AberturaForm,
  type ParedeForm,
} from "@/lib/configurador"
import { calcularValorPapel, formatarM2, formatarMoeda, formatarNumero, type Metragem } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { TipoAbertura } from "@/types"

interface CampoMedidaProps {
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  max?: number
  placeholder?: string
}

function CampoMedida({ rotulo, valor, onChange, max, placeholder = "Ex.: 2,60" }: CampoMedidaProps) {
  const id = useId()
  const erro = validarMedida(valor, max)
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          placeholder={placeholder}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className="pr-12"
        />
        <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-foreground-subtle">
          m
        </span>
      </div>
      {erro && (
        <p id={`${id}-erro`} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  )
}

const NOME_ABERTURA: Record<TipoAbertura, string> = { porta: "Porta", janela: "Janela" }

interface CalculadoraProps {
  paredes: ParedeForm[]
  onChange: (paredes: ParedeForm[]) => void
  metragem: Metragem
  margemPerda: number
  precoM2: number
}

export function Calculadora({ paredes, onChange, metragem, margemPerda, precoM2 }: CalculadoraProps) {
  function alterarParede(id: string, dados: Partial<ParedeForm>) {
    onChange(paredes.map((p) => (p.id === id ? { ...p, ...dados } : p)))
  }

  function alterarAbertura(parede: ParedeForm, id: string, dados: Partial<AberturaForm>) {
    alterarParede(parede.id, { aberturas: parede.aberturas.map((a) => (a.id === id ? { ...a, ...dados } : a)) })
  }

  const temArea = metragem.m2 > 0

  return (
    <div data-slot="calculadora" className="flex flex-col gap-5">
      <GuiaMedir />

      <ol className="flex flex-col gap-5">
        {paredes.map((parede, i) => {
          const rotulo = `Parede ${i + 1}`
          return (
            <li
              key={parede.id}
              data-slot="parede"
              className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-sans text-lg font-medium">{rotulo}</h3>
                {paredes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(paredes.filter((p) => p.id !== parede.id))}
                    className="text-destructive"
                  >
                    <Trash2Icon aria-hidden />
                    Remover <span className="sr-only">{rotulo}</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CampoMedida
                  rotulo="Largura"
                  valor={parede.largura}
                  placeholder="Ex.: 3,20"
                  onChange={(v) => alterarParede(parede.id, { largura: v })}
                />
                <CampoMedida
                  rotulo="Altura"
                  valor={parede.altura}
                  max={10}
                  onChange={(v) => alterarParede(parede.id, { altura: v })}
                />
              </div>

              <DesenhoParede parede={paredeFormParaParede(parede)} rotulo={rotulo} />

              {parede.aberturas.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {parede.aberturas.map((a, j) => (
                    <li key={a.id} className="flex flex-col gap-3 rounded-md border border-border bg-muted/60 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {NOME_ABERTURA[a.tipo]} {j + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => alterarParede(parede.id, { aberturas: parede.aberturas.filter((x) => x.id !== a.id) })}
                        >
                          <Trash2Icon aria-hidden />
                          Remover <span className="sr-only">{`${NOME_ABERTURA[a.tipo]} ${j + 1} da ${rotulo}`}</span>
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <CampoMedida rotulo="Largura" valor={a.largura} max={10} onChange={(v) => alterarAbertura(parede, a.id, { largura: v })} />
                        <CampoMedida rotulo="Altura" valor={a.altura} max={10} onChange={(v) => alterarAbertura(parede, a.id, { altura: v })} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-foreground-subtle">Tem porta ou janela nesta parede?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => alterarParede(parede.id, { aberturas: [...parede.aberturas, novaAbertura("porta")] })}
                  >
                    <DoorClosedIcon aria-hidden />+ Porta
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => alterarParede(parede.id, { aberturas: [...parede.aberturas, novaAbertura("janela")] })}
                  >
                    <SquareIcon aria-hidden />+ Janela
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <Button variant="outline" size="lg" onClick={() => onChange([...paredes, novaParede()])}>
        <PlusIcon aria-hidden />
        Adicionar outra parede
      </Button>

      <div
        data-slot="resultado-metragem"
        aria-live="polite"
        className={cn("flex flex-col gap-3 rounded-md border p-4", temArea ? "border-primary/40 bg-primary-soft/50" : "border-border bg-surface")}
      >
        {temArea ? (
          <>
            <dl className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-4">
                <dt>Área das paredes</dt>
                <dd className="font-medium tabular-nums">{formatarM2(metragem.areaBruta)}</dd>
              </div>
              {metragem.areaAberturas > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>Portas e janelas</dt>
                  <dd className="font-medium tabular-nums">− {formatarM2(metragem.areaAberturas)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt>Sobra para recortes ({formatarNumero(margemPerda)}%)</dt>
                <dd className="font-medium tabular-nums">+ {formatarM2(metragem.areaPerda)}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-4 border-t border-border pt-2 text-lg">
                <dt className="font-medium">Total de papel</dt>
                <dd className="font-medium tabular-nums">{formatarM2(metragem.m2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>
                  {formatarM2(metragem.m2)} × {formatarMoeda(precoM2)}
                </dt>
                <dd className="font-medium tabular-nums">{formatarMoeda(calcularValorPapel(metragem.m2, precoM2))}</dd>
              </div>
            </dl>
            <p className="text-sm text-foreground-subtle">
              Por que a sobra? Nos cortes e no encaixe da estampa sempre se perde um pouco de papel. Por isso
              somamos {formatarNumero(margemPerda)}% — assim não falta na hora da aplicação.
            </p>
          </>
        ) : (
          <p>Digite a largura e a altura da parede para ver quantos metros quadrados você precisa.</p>
        )}
      </div>
    </div>
  )
}
