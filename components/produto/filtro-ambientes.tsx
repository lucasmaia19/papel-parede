"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { IconeLavavel } from "@/components/icones-adesivo"
import { OpcaoBotao } from "@/components/opcao-botao"
import { hrefAmbiente, type FiltroAmbiente } from "@/lib/ambientes"
import { cn } from "@/lib/utils"
import type { Ambiente, GrupoAmbiente } from "@/types"

function ImagemAmbiente({ ambiente, className }: { ambiente: Ambiente; className?: string }) {
  return (
    <span className={cn("relative block aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted", className)}>
      {ambiente.imagem && (
        // eslint-disable-next-line @next/next/no-img-element -- ilustração SVG ou base64 enviada pelo admin
        <img src={ambiente.imagem} alt="" loading="lazy" className="size-full object-cover" />
      )}
    </span>
  )
}

/** Home: grade de ambientes (2 colunas no celular); cada um leva ao catálogo filtrado. */
export function GradeAmbientes({ ambientes }: { ambientes: Ambiente[] }) {
  return (
    <ul data-slot="grade-ambientes" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      {ambientes.map((a) => (
        <li key={a.id}>
          <Link
            href={hrefAmbiente(a)}
            className="group flex flex-col gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <ImagemAmbiente ambiente={a} className="transition-colors group-hover:border-rose" />
            <span className="flex min-h-12 flex-col justify-center">
              <span className="font-heading text-xl leading-tight text-foreground-heading">{a.nome}</span>
              {a.destaque && <span className="text-sm text-foreground-subtle">{a.destaque}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Catálogo: blocos grandes com imagem e nome. No celular rolam para o lado
 * (com o próximo aparecendo pela metade e uma dica); no desktop, grade.
 */
export function BlocosAmbientes({
  ambientes,
  escolhido,
  onEscolher,
}: {
  ambientes: Ambiente[]
  escolhido: string | null
  onEscolher: (slug: string | null) => void
}) {
  const lista = useRef<HTMLUListElement>(null)

  // Ambiente escolhido (ex.: link compartilhado) sempre à vista no carrossel, sem rolar a página
  useEffect(() => {
    const ul = lista.current
    const bloco = ul?.querySelector<HTMLElement>("[aria-pressed=true]")?.parentElement
    if (!ul || !bloco || ul.scrollWidth <= ul.clientWidth) return
    const caixa = ul.getBoundingClientRect()
    const r = bloco.getBoundingClientRect()
    if (r.left < caixa.left || r.right > caixa.right) ul.scrollTo({ left: ul.scrollLeft + r.left - caixa.left - 16 })
  }, [escolhido])

  return (
    <div className="flex flex-col gap-2">
      <ul
        ref={lista}
        data-slot="blocos-ambientes"
        aria-label="Ambientes"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-3 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {ambientes.map((a) => {
          const ativo = escolhido === a.slug
          return (
            <li key={a.id} className="w-[8.75rem] shrink-0 snap-start lg:w-auto">
              <button
                type="button"
                aria-pressed={ativo}
                data-slot="bloco-ambiente"
                onClick={() => onEscolher(ativo ? null : a.slug)}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-md border p-1.5 pb-2 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  ativo ? "border-primary bg-primary-soft" : "border-transparent hover:bg-muted",
                )}
              >
                <span className="relative">
                  <ImagemAmbiente ambiente={a} />
                  {ativo && (
                    <span className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-4" aria-hidden />
                    </span>
                  )}
                </span>
                <span className="px-1 font-heading text-lg leading-tight text-foreground-heading">{a.nome}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p aria-hidden className="flex items-center gap-1.5 text-sm text-foreground-subtle lg:hidden">
        Deslize para ver mais ambientes
        <ArrowRightIcon className="size-4" />
      </p>
    </div>
  )
}

/** Perguntas do ambiente escolhido, abrindo logo abaixo com fade + altura. */
export function PerguntasAmbiente({
  ambiente,
  filtro,
  onAlternar,
}: {
  ambiente: Ambiente | null
  filtro: FiltroAmbiente
  onAlternar: (grupo: GrupoAmbiente, opcaoSlug: string) => void
}) {
  // Mantém o último ambiente na tela enquanto o painel fecha
  const [mostrado, setMostrado] = useState<Ambiente | null>(ambiente)
  if (ambiente && ambiente.id !== mostrado?.id) setMostrado(ambiente)
  const temConteudo = (a: Ambiente | null) => Boolean(a && (a.grupos.length > 0 || a.destaque))
  const aberto = temConteudo(ambiente)
  const conteudo = aberto ? ambiente : mostrado

  return (
    <div
      data-slot="perguntas-ambiente"
      data-aberto={aberto ? "" : undefined}
      inert={!aberto}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
        aberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        {conteudo && temConteudo(conteudo) && (
          <div className="flex flex-col gap-6 rounded-md border border-border bg-surface p-4 md:p-6">
            {conteudo.destaque && (
              <p className="flex items-center gap-2 font-medium text-sage-foreground">
                <IconeLavavel className="size-7 shrink-0" />
                {conteudo.destaque}
              </p>
            )}
            {conteudo.grupos.map((g) => {
              const marcadas = filtro.ambiente === conteudo.slug ? (filtro.opcoes[g.slug] ?? []) : []
              return (
                <fieldset key={g.id} data-slot="pergunta-ambiente" className="flex flex-col gap-3">
                  <legend className="mb-1 font-heading text-2xl text-foreground-heading">{g.pergunta}</legend>
                  {g.multiplo && <p className="-mt-2 text-sm text-foreground-subtle">Pode marcar mais de uma.</p>}
                  <div className="flex flex-wrap gap-2">
                    {g.opcoes.map((o) => (
                      <OpcaoBotao
                        key={o.id}
                        ativo={marcadas.includes(o.slug)}
                        onClick={() => onAlternar(g, o.slug)}
                        className="rounded-full px-5"
                      >
                        {o.nome}
                      </OpcaoBotao>
                    ))}
                  </div>
                </fieldset>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
