"use client"

import { useEffect, useRef, useState } from "react"
import { MinusIcon, PlusIcon, RulerIcon, ZoomInIcon } from "lucide-react"
import { ReguaImagem } from "@/components/produto/regua-imagem"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Regua } from "@/types"

export interface ImagemGaleria {
  url: string
  alt: string
}

interface GaleriaProps {
  imagens: ImagemGaleria[]
  /** Régua da imagem principal (índice 0) */
  regua: Regua | null
  className?: string
}

export function Galeria({ imagens, regua, className }: GaleriaProps) {
  const trilho = useRef<HTMLDivElement>(null)
  const [indice, setIndice] = useState(0)
  const [mostrarRegua, setMostrarRegua] = useState(false)
  const [zoomAberto, setZoomAberto] = useState(false)
  const [zoom, setZoom] = useState(1)

  const temRegua = Boolean(regua && regua.pixelsPorCm > 0)
  const comRegua = mostrarRegua && regua && temRegua
  const chaveImagens = imagens.map((i) => i.url).join("|")

  // Trocou a cor (imagens novas): volta para a primeira foto
  const [chaveAnterior, setChaveAnterior] = useState(chaveImagens)
  if (chaveAnterior !== chaveImagens) {
    setChaveAnterior(chaveImagens)
    setIndice(0)
  }
  useEffect(() => {
    trilho.current?.scrollTo({ left: 0 })
  }, [chaveImagens])

  function irPara(i: number) {
    const el = trilho.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
    setIndice(i)
  }

  function aoRolar() {
    const el = trilho.current
    if (!el || el.clientWidth === 0) return
    setIndice(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div data-slot="galeria" className={cn("flex flex-col gap-3", className)}>
      {comRegua ? (
        // Régua ligada: a foto principal, limpa, com as réguas nas margens de fora
        <ReguaImagem src={imagens[0]?.url ?? ""} alt={imagens[0]?.alt ?? ""} regua={regua} />
      ) : (
        <>
          <div className="relative">
            <div
              ref={trilho}
              onScroll={aoRolar}
              // Focável: no teclado, as setas passam as fotos
              tabIndex={0}
              role="region"
              className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-md border border-border bg-muted outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/60 [&::-webkit-scrollbar]:hidden"
              aria-roledescription="carrossel"
              aria-label="Fotos do produto. Deslize para o lado para ver mais."
            >
              {imagens.map((img, i) => (
                <div
                  key={`${img.url}-${i}`}
                  className="relative aspect-square w-full shrink-0 snap-center"
                  aria-roledescription="foto"
                  aria-label={`Foto ${i + 1} de ${imagens.length}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagens podem ser base64 enviadas pelo admin */}
                  <img src={img.url} alt={img.alt} draggable={false} className="size-full object-cover select-none" />
                </div>
              ))}
            </div>
            {imagens.length > 1 && (
              <p className="pointer-events-none absolute right-2 bottom-2 rounded-sm bg-surface-raised/90 px-2 py-0.5 text-sm font-medium text-foreground">
                {indice + 1} / {imagens.length}
              </p>
            )}
          </div>

          {imagens.length > 1 && (
            <div className="flex gap-2" role="group" aria-label="Escolher foto">
              {imagens.map((img, i) => (
                <button
                  key={`${img.url}-mini-${i}`}
                  type="button"
                  onClick={() => irPara(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === indice ? "true" : undefined}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-md border-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === indice ? "border-foreground-subtle" : "border-border opacity-80 hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniatura */}
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="grid gap-2 min-[400px]:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        {temRegua ? (
          <Button
            variant="outline"
            aria-pressed={mostrarRegua}
            onClick={() => {
              setMostrarRegua((v) => !v)
              setIndice(0)
            }}
          >
            <RulerIcon aria-hidden />
            {mostrarRegua ? "Ocultar régua" : "Mostrar régua"}
          </Button>
        ) : null}
        <Button variant="outline" onClick={() => setZoomAberto(true)}>
          <ZoomInIcon aria-hidden />
          Ampliar foto
        </Button>
      </div>

      <Dialog
        open={zoomAberto}
        onOpenChange={(aberto) => {
          setZoomAberto(aberto)
          if (!aberto) setZoom(1)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle>Foto ampliada</DialogTitle>
          <div className="max-h-[60dvh] touch-pan-x touch-pan-y touch-pinch-zoom overflow-auto rounded-md border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- zoom livre */}
            <img
              src={imagens[indice]?.url}
              alt={imagens[indice]?.alt ?? ""}
              style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
              className="block"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setZoom((z) => Math.max(1, z - 1))} disabled={zoom <= 1}>
              <MinusIcon aria-hidden />
              Afastar
            </Button>
            <Button variant="outline" onClick={() => setZoom((z) => Math.min(4, z + 1))} disabled={zoom >= 4}>
              <PlusIcon aria-hidden />
              Aproximar
            </Button>
          </div>
          <p className="text-sm text-foreground-subtle">No celular, você também pode usar dois dedos para aproximar.</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
