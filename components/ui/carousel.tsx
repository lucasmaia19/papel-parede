"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ComponentProps, type KeyboardEvent } from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1]

interface CarouselProps {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  setApi?: (api: CarouselApi) => void
  /** Troca sem transição (setas e teclado), para quem pediu menos movimento */
  instantaneo?: boolean
}

interface CarouselContextProps extends CarouselProps {
  carouselRef: UseEmblaCarouselType[0]
  api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
}

const CarouselContext = createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const contexto = useContext(CarouselContext)
  if (!contexto) throw new Error("useCarousel precisa estar dentro de <Carousel />")
  return contexto
}

/** Carrossel (Embla), no padrão do shadcn/ui. As setas do teclado passam os itens. */
function Carousel({ opts, plugins, setApi, instantaneo, className, children, ...props }: ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(opts, plugins)

  const scrollPrev = useCallback(() => api?.scrollPrev(instantaneo), [api, instantaneo])
  const scrollNext = useCallback(() => api?.scrollNext(instantaneo), [api, instantaneo])

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      scrollPrev()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      scrollNext()
    }
  }

  useEffect(() => {
    if (api) setApi?.(api)
  }, [api, setApi])

  return (
    <CarouselContext.Provider value={{ carouselRef, api, opts, plugins, scrollPrev, scrollNext }}>
      <div data-slot="carousel" onKeyDownCapture={aoTeclar} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: ComponentProps<"div">) {
  const { carouselRef } = useCarousel()
  return (
    <div ref={carouselRef} data-slot="carousel-content" className="h-full overflow-hidden">
      <div className={cn("flex h-full touch-pan-y", className)} {...props} />
    </div>
  )
}

function CarouselItem({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("h-full min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  )
}

const classeSeta =
  "inline-flex size-12 items-center justify-center rounded-full border border-border bg-background/90 text-foreground-heading transition-colors outline-none hover:bg-surface-raised focus-visible:ring-3 focus-visible:ring-ring/60 [&_svg]:size-5"

function CarouselPrevious({ className, ...props }: ComponentProps<"button">) {
  const { scrollPrev } = useCarousel()
  return (
    <button type="button" data-slot="carousel-previous" aria-label="Anterior" onClick={scrollPrev} className={cn(classeSeta, className)} {...props}>
      <ChevronLeftIcon aria-hidden />
    </button>
  )
}

function CarouselNext({ className, ...props }: ComponentProps<"button">) {
  const { scrollNext } = useCarousel()
  return (
    <button type="button" data-slot="carousel-next" aria-label="Próximo" onClick={scrollNext} className={cn(classeSeta, className)} {...props}>
      <ChevronRightIcon aria-hidden />
    </button>
  )
}

/** Acompanha o item selecionado (e o anterior, para transições de saída). */
function useCarouselSelecionado(api: CarouselApi) {
  const [estado, setEstado] = useState({ atual: 0, anterior: -1 })
  useEffect(() => {
    if (!api) return
    const aoSelecionar = () =>
      setEstado((e) => {
        const atual = api.selectedScrollSnap()
        return atual === e.atual ? e : { atual, anterior: e.atual }
      })
    aoSelecionar()
    api.on("select", aoSelecionar).on("reInit", aoSelecionar)
    return () => {
      api.off("select", aoSelecionar).off("reInit", aoSelecionar)
    }
  }, [api])
  return estado
}

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel, useCarouselSelecionado, type CarouselApi }
