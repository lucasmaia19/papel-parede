"use client"

import { useId, useState } from "react"
import { ChevronsLeftRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparacaoSliderProps {
  antes: string
  depois: string
  rotuloAntes?: string
  rotuloDepois?: string
  altAntes: string
  altDepois: string
  /** proporção do quadro, ex.: "aspect-[16/11]" */
  proporcao?: string
  className?: string
}

/**
 * Comparação arrastável (antes × depois). Por baixo é um <input type="range">:
 * funciona com dedo, mouse e teclado (setas), e lê o valor para leitores de tela.
 */
export function ComparacaoSlider({
  antes,
  depois,
  rotuloAntes = "Antes",
  rotuloDepois = "Depois",
  altAntes,
  altDepois,
  proporcao = "aspect-square",
  className,
}: ComparacaoSliderProps) {
  const [posicao, setPosicao] = useState(50)
  const id = useId()

  return (
    <div data-slot="comparacao" className={cn("flex flex-col gap-2", className)}>
      <div className={cn("relative overflow-hidden rounded-md border border-border bg-muted select-none", proporcao)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pode ser base64 */}
        <img src={depois} alt={altDepois} className="absolute inset-0 size-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - posicao}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- pode ser base64 */}
          <img src={antes} alt={altAntes} className="size-full object-cover" draggable={false} />
        </div>

        <span className="pointer-events-none absolute top-2 left-2 rounded-sm bg-surface-raised/90 px-2 py-0.5 text-sm font-medium text-foreground-heading">
          {rotuloAntes}
        </span>
        <span className="pointer-events-none absolute top-2 right-2 rounded-sm bg-surface-raised/90 px-2 py-0.5 text-sm font-medium text-foreground-heading">
          {rotuloDepois}
        </span>

        {/* linha e alça */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-surface-raised shadow-[0_0_0_1px_rgb(122_99_89/0.3)]" style={{ left: `${posicao}%` }}>
          <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-rose bg-surface-raised text-foreground-heading shadow-sm">
            <ChevronsLeftRightIcon className="size-6" />
          </span>
        </div>

        <label htmlFor={id} className="sr-only">
          Arraste para comparar {rotuloAntes.toLowerCase()} e {rotuloDepois.toLowerCase()}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={posicao}
          onChange={(e) => setPosicao(Number(e.target.value))}
          aria-valuetext={`${posicao}% ${rotuloAntes.toLowerCase()}`}
          data-teste-ignorar-tamanho
          className="absolute inset-0 size-full cursor-ew-resize touch-pan-y opacity-0"
        />
      </div>
      <p className="text-sm text-foreground-subtle">Arraste a alça para os lados para comparar.</p>
    </div>
  )
}
