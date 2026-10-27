"use client"

import { useEffect, useRef, useState } from "react"
import { MinusIcon, PlusIcon, RulerIcon, ZoomInIcon } from "lucide-react"
import { ReguaOverlay, textoMedida } from "@/components/produto/regua-overlay"
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

function useTamanho<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [tamanho, setTamanho] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setTamanho({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, tamanho] as const
}

export function Galeria({ imagens, regua, className }: GaleriaProps) {
  const trilho = useRef<HTMLDivElement>(null)
  const [indice, setIndice] = useState(0)
  const [mostrarRegua, setMostrarRegua] = useState(false)
  const [zoomAberto, setZoomAberto] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [refSlide, tamanhoSlide] = useTamanho<HTMLDivElement>()
  const [natural, setNatural] = useState({ w: 0, h: 0 })

  const temRegua = Boolean(regua && regua.pixelsPorCm > 0)
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

  // Se a imagem já veio do cache, o onLoad pode ter disparado antes da hidratação
  function medirImagem(img: HTMLImageElement | null) {
    if (img?.complete && img.naturalWidth > 0) {
      setNatural((n) => (n.w === img.naturalWidth && n.h === img.naturalHeight ? n : { w: img.naturalWidth, h: img.naturalHeight }))
    }
  }

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

  // Escala da foto na tela (object-cover) → px por cm visíveis
  const escala =
    natural.w > 0 && natural.h > 0 ? Math.max(tamanhoSlide.w / natural.w, tamanhoSlide.h / natural.h) : 0
  const pxPorCm = regua ? regua.pixelsPorCm * escala : 0

  return (
    <div data-slot="galeria" className={cn("flex flex-col gap-3", className)}>
      <div className="relative">
        <div
          ref={trilho}
          onScroll={aoRolar}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-md border border-border bg-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carrossel"
          aria-label="Fotos do produto. Deslize para o lado para ver mais."
        >
          {imagens.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              ref={i === 0 ? refSlide : undefined}
              className="relative aspect-square w-full shrink-0 snap-center"
              aria-roledescription="foto"
              aria-label={`Foto ${i + 1} de ${imagens.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imagens podem ser base64 enviadas pelo admin */}
              <img
                ref={i === 0 ? medirImagem : undefined}
                src={img.url}
                alt={img.alt}
                draggable={false}
                onLoad={i === 0 ? (e) => medirImagem(e.currentTarget) : undefined}
                className="size-full object-cover select-none"
              />
              {i === 0 && mostrarRegua && regua && (
                <ReguaOverlay largura={tamanhoSlide.w} altura={tamanhoSlide.h} pxPorCm={pxPorCm} medidas={regua.medidas} />
              )}
            </div>
          ))}
        </div>
        {imagens.length > 1 && (
          <p className="pointer-events-none absolute right-2 bottom-2 rounded-sm bg-foreground/80 px-2 py-0.5 text-sm font-semibold text-white">
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
                i === indice ? "border-foreground" : "border-border opacity-80 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura */}
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-2 min-[400px]:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        {temRegua ? (
          <Button
            variant="outline"
            aria-pressed={mostrarRegua}
            onClick={() => {
              setMostrarRegua((v) => !v)
              if (indice !== 0) irPara(0)
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

      {mostrarRegua && regua && (
        <div className="rounded-md border border-border bg-surface p-3" aria-live="polite">
          <p className="font-semibold">Régua em centímetros ligada.</p>
          {regua.medidas.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-0.5">
              {regua.medidas.map((m) => (
                <li key={m.id}>{textoMedida(m)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-foreground-subtle">Use as marcações para ter ideia do tamanho real.</p>
          )}
        </div>
      )}

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
