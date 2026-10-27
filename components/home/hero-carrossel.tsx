"use client"

import { useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { getImageProps } from "next/image"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import Fade from "embla-carousel-fade"
import { PauseIcon, PlayIcon } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarouselSelecionado,
  type CarouselApi,
} from "@/components/ui/carousel"
import { buttonVariants } from "@/components/ui/button"
import { WhatsappLink } from "@/components/whatsapp-link"
import { useMovimentoReduzido } from "@/lib/use-movimento-reduzido"
import { cn } from "@/lib/utils"

/** Tempo de cada slide (o mesmo da barra de progresso e do Ken Burns, em globals.css) */
const TEMPO_SLIDE = 6000

type Acao = { tipo: "link"; href: string } | { tipo: "ancora"; id: string } | { tipo: "whatsapp"; mensagem: string }

interface Slide {
  titulo: string
  texto: string
  botao: string
  acao: Acao
  alt: string
  /** Cor de fundo enquanto a foto carrega */
  fundo: string
}

export const SLIDES_HERO: Slide[] = [
  {
    titulo: "Arte feita à mão",
    texto: "Cada estampa nasce de um desenho em aquarela, pintado à mão no nosso ateliê.",
    botao: "Ver estampas",
    acao: { tipo: "link", href: "/produtos" },
    alt: "Parede com papel floral em aquarela rosada, aparador de madeira com vaso de planta e pincéis",
    fundo: "var(--muted)",
  },
  {
    titulo: "Feito para o seu cantinho",
    texto: "Papéis de parede que trazem delicadeza e afeto para cada ambiente.",
    botao: "Ver na sua parede",
    acao: { tipo: "link", href: "/produtos/lacos-e-flores#simulacao" },
    alt: "Quarto de bebê com papel azul-claro de nuvens e estrelas atrás de um berço",
    fundo: "var(--blue-grey)",
  },
  {
    titulo: "Personalizado para você",
    texto: "Escolha cores, tamanhos da estampa e material. A gente ajusta cada detalhe com carinho.",
    botao: "Como personalizar",
    acao: { tipo: "link", href: "/produtos" },
    alt: "Sala com papel listrado rosé, sofá bege e amostras de cores na parede",
    fundo: "var(--muted)",
  },
  {
    titulo: "Lavável, até no banheiro e no teto",
    texto: "Nosso papel adesivo pode ser lavado e limpo com pano úmido, e vai bem em banheiros e tetos.",
    botao: "Conhecer o adesivo",
    acao: { tipo: "ancora", id: "adesivo-lavavel" },
    alt: "Banheiro com papel verde-sálvia de raminhos na parede e no teto, banheira e luminária pendente",
    fundo: "var(--sage)",
  },
  {
    titulo: "Atendimento de pessoa para pessoa",
    texto: "Medimos, orientamos e aplicamos em Uberlândia e região. Enviamos para todo o Brasil.",
    botao: "Falar no WhatsApp",
    acao: { tipo: "whatsapp", mensagem: "Olá! Vim pelo site da Rodovalho e gostaria de atendimento." },
    alt: "Parede com papel de linho bege e aparador com rolos de papel de parede",
    fundo: "var(--muted)",
  },
]

/** Foto com art direction: 4:5 até 767px, 16:7 acima. Só a primeira é prioritária (LCP). */
function FotoSlide({ indice, alt, prioritaria }: { indice: number; alt: string; prioritaria: boolean }) {
  const comum = { alt, sizes: "100vw", ...(prioritaria ? { fetchPriority: "high" as const, loading: "eager" as const } : { loading: "lazy" as const }) }
  const { props: mobile } = getImageProps({ ...comum, src: `/hero/slide-${indice + 1}-mobile.webp`, width: 864, height: 1080 })
  const { props: desktop } = getImageProps({ ...comum, src: `/hero/slide-${indice + 1}-desktop.webp`, width: 1920, height: 840 })
  // Com images.unoptimized não há srcSet: cai para o src
  const srcSetMobile = mobile.srcSet ?? mobile.src
  return (
    <picture>
      {prioritaria && (
        <>
          {/* Preload com media (o React leva para o <head>): baixa só a versão da tela, antes do <picture> */}
          <link rel="preload" as="image" href={mobile.src} imageSrcSet={mobile.srcSet} imageSizes="100vw" media="(max-width: 767px)" fetchPriority="high" />
          <link rel="preload" as="image" href={desktop.src} imageSrcSet={desktop.srcSet} imageSizes="100vw" media="(min-width: 768px)" fetchPriority="high" />
        </>
      )}
      <source media="(max-width: 767px)" srcSet={srcSetMobile} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- o alt vem de getImageProps */}
      <img {...desktop} data-slot="hero-foto" className="hero-ken-burns absolute inset-0 size-full object-cover" />
    </picture>
  )
}

function BotaoSlide({ slide, movimentoReduzido }: { slide: Slide; movimentoReduzido: boolean }) {
  const classe = cn(buttonVariants({ size: "lg" }), "hero-entra w-full [animation-delay:200ms] sm:w-auto")
  const { acao } = slide
  if (acao.tipo === "whatsapp") {
    return (
      <WhatsappLink mensagem={acao.mensagem} size="lg" className="hero-entra w-full [animation-delay:200ms] sm:w-auto">
        {slide.botao}
      </WhatsappLink>
    )
  }
  if (acao.tipo === "ancora") {
    function rolar(e: MouseEvent<HTMLAnchorElement>) {
      if (acao.tipo !== "ancora") return
      const alvo = document.getElementById(acao.id)
      if (!alvo) return
      e.preventDefault()
      alvo.scrollIntoView({ behavior: movimentoReduzido ? "auto" : "smooth", block: "start" })
      alvo.focus({ preventScroll: true })
      history.replaceState(null, "", `#${acao.id}`)
    }
    return (
      <a href={`#${acao.id}`} onClick={rolar} className={classe}>
        {slide.botao}
      </a>
    )
  }
  return (
    <Link href={acao.href} className={classe}>
      {slide.botao}
    </Link>
  )
}

/** Borda inferior ondulada (recorte "scalloped") na cor do fundo da página */
function BordaOndulada() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px z-10 h-3.5 w-full text-background" preserveAspectRatio="none">
      <defs>
        <pattern id="hero-onda" width="28" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14 A14 14 0 0 1 28 14 Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-onda)" />
    </svg>
  )
}

function Indicadores({
  api,
  atual,
  ciclo,
  progredindo,
  movimentoReduzido,
  children,
}: {
  api: CarouselApi
  atual: number
  ciclo: number
  progredindo: boolean
  movimentoReduzido: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex items-center rounded-full bg-background/85 px-1.5" data-slot="hero-indicadores">
      {children}
      {SLIDES_HERO.map((s, i) => {
        const ativo = i === atual
        return (
          <button
            key={s.titulo}
            type="button"
            onClick={() => api?.scrollTo(i, movimentoReduzido)}
            aria-label={`Ir para o slide ${i + 1}: ${s.titulo}`}
            aria-current={ativo ? "true" : undefined}
            className={cn(
              "group flex h-12 items-center justify-center rounded-full outline-none transition-[width] duration-500 focus-visible:ring-3 focus-visible:ring-ring/60",
              ativo ? "w-14" : "w-9",
            )}
          >
            <span
              className={cn(
                "relative block h-[3px] overflow-hidden rounded-full bg-foreground-subtle/35 transition-[width] duration-500",
                ativo ? "w-10" : "w-5 group-hover:bg-foreground-subtle/60",
              )}
            >
              {ativo && (
                <span
                  key={ciclo}
                  data-slot="hero-progresso"
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-foreground-subtle",
                    progredindo ? "hero-progresso" : "w-full",
                  )}
                />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function HeroCarrossel() {
  const movimentoReduzido = useMovimentoReduzido()
  const [api, setApi] = useState<CarouselApi>()
  // Plugins criados uma vez só (trocar a referência reinicia o Embla)
  const [plugins] = useState(() => [Autoplay({ delay: TEMPO_SLIDE, playOnInit: false }), Fade()])
  const { atual, anterior } = useCarouselSelecionado(api)

  const [pausadoPelaPessoa, setPausadoPelaPessoa] = useState(false)
  const [mouseEmCima, setMouseEmCima] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const [ciclo, setCiclo] = useState(0)
  const [progredindo, setProgredindo] = useState(false)
  const [jaTrocou, setJaTrocou] = useState(false)
  const [carregarResto, setCarregarResto] = useState(false)

  const rodando = !movimentoReduzido && !pausadoPelaPessoa && !mouseEmCima && !arrastando

  // Autoplay controlado aqui: o plugin sozinho voltaria a tocar após toque ou hover, mesmo com a pausa ligada
  useEffect(() => {
    const autoplay = api?.plugins().autoplay
    if (!autoplay) return
    if (rodando) autoplay.play()
    else autoplay.stop()
  }, [api, rodando])

  useEffect(() => {
    if (!api) return
    const aoTocar = () => setArrastando(true)
    // Retoma com o tempo cheio do slide (alguns segundos depois de soltar)
    const aoSoltar = () => setArrastando(false)
    const aoArmar = () => {
      setCiclo((c) => c + 1)
      setProgredindo(true)
    }
    const aoParar = () => setProgredindo(false)
    const aoSelecionar = () => {
      setJaTrocou(true)
      setCarregarResto(true)
    }
    api.on("pointerDown", aoTocar).on("pointerUp", aoSoltar).on("select", aoSelecionar)
    api.on("autoplay:timerset", aoArmar).on("autoplay:timerstopped", aoParar)
    return () => {
      api.off("pointerDown", aoTocar).off("pointerUp", aoSoltar).off("select", aoSelecionar)
      api.off("autoplay:timerset", aoArmar).off("autoplay:timerstopped", aoParar)
    }
  }, [api])

  // As outras fotos só depois que a página terminou de carregar (não disputam com a primeira)
  useEffect(() => {
    if (carregarResto) return
    let id = 0
    const agendar = () => {
      id = window.setTimeout(() => setCarregarResto(true), 1200)
    }
    if (document.readyState === "complete") agendar()
    else window.addEventListener("load", agendar, { once: true })
    return () => {
      window.removeEventListener("load", agendar)
      window.clearTimeout(id)
    }
  }, [carregarResto])

  return (
    <section
      data-slot="hero"
      aria-roledescription="carrossel"
      aria-label="Destaques da Rodovalho"
      data-animar={jaTrocou && !movimentoReduzido ? "" : undefined}
      data-pausado={rodando ? undefined : ""}
      onPointerEnter={(e) => e.pointerType === "mouse" && setMouseEmCima(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setMouseEmCima(false)}
      className="relative"
    >
      <h1 className="sr-only">Rodovalho Papéis de Parede — papel de parede delicado, sob medida, em Uberlândia-MG</h1>

      <Carousel
        opts={{ loop: true, duration: 34 }}
        plugins={plugins}
        setApi={setApi}
        instantaneo={movimentoReduzido}
        className="h-[78svh] max-h-[640px] min-h-[540px] md:h-[70vh] md:max-h-[680px] md:min-h-[480px]"
      >
        <CarouselContent aria-live={rodando ? "off" : "polite"}>
          {SLIDES_HERO.map((s, i) => {
            const ativo = i === atual
            return (
              <CarouselItem
                key={s.titulo}
                aria-label={`Slide ${i + 1} de ${SLIDES_HERO.length}`}
                data-ativo={ativo ? "" : undefined}
                data-saindo={i === anterior && !ativo ? "" : undefined}
                inert={!ativo}
              >
                <div className="relative size-full overflow-hidden" style={{ backgroundColor: s.fundo }}>
                  {(i === 0 || carregarResto) && <FotoSlide indice={i} alt={s.alt} prioritaria={i === 0} />}
                  {/* Desktop: véu creme do lado do texto (contraste AA sobre qualquer foto) */}
                  <div
                    aria-hidden
                    className="absolute inset-0 hidden bg-linear-to-r from-background/92 via-background/78 via-40% to-transparent to-68% md:block"
                  />
                  <div className="absolute inset-0 flex items-end pb-[5.5rem] md:items-center md:pb-12">
                    <div className="container-loja">
                      <div className="flex max-w-md flex-col gap-3 rounded-lg bg-background/85 p-5 md:max-w-lg md:gap-4 md:bg-transparent md:p-0">
                        <h2 className="hero-entra text-[2rem] leading-[1.1] md:text-5xl">{s.titulo}</h2>
                        <p className="hero-entra text-base leading-snug [animation-delay:100ms] md:text-xl md:leading-normal">{s.texto}</p>
                        <div className="pt-1">
                          <BotaoSlide slide={s} movimentoReduzido={movimentoReduzido} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        <div className="absolute inset-x-0 bottom-5 z-20 md:bottom-7">
          <div className="container-loja flex items-center justify-center md:justify-between">
            <Indicadores api={api} atual={atual} ciclo={ciclo} progredindo={progredindo && rodando} movimentoReduzido={movimentoReduzido}>
              {!movimentoReduzido && (
                <button
                  type="button"
                  data-slot="hero-pausa"
                  onClick={() => setPausadoPelaPessoa((p) => !p)}
                  aria-label={pausadoPelaPessoa ? "Retomar a troca automática dos destaques" : "Pausar a troca automática dos destaques"}
                  className="flex size-12 items-center justify-center rounded-full text-foreground-heading outline-none focus-visible:ring-3 focus-visible:ring-ring/60 [&_svg]:size-4"
                >
                  {pausadoPelaPessoa ? <PlayIcon aria-hidden /> : <PauseIcon aria-hidden />}
                </button>
              )}
            </Indicadores>
            <div className="hidden gap-2 md:flex">
              <CarouselPrevious aria-label="Destaque anterior" />
              <CarouselNext aria-label="Próximo destaque" />
            </div>
          </div>
        </div>
      </Carousel>

      <BordaOndulada />
    </section>
  )
}
