"use client"

import { useEffect, useRef, type ComponentProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Ícones de traço fino (1,4), no tom do texto. Desenhados aqui: o lucide não tem "pano" nem "teto".
function Icone({ children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-9 shrink-0 text-foreground-heading"
      {...props}
    >
      {children}
    </svg>
  )
}

/** Gota com brilhos: pode ser lavado */
function IconeLavavel() {
  return (
    <Icone>
      <path d="M14 4.5c-3.6 5-7 9.3-7 13.6a7 7 0 0 0 14 0c0-4.3-3.4-8.6-7-13.6Z" />
      <path d="M10.6 18.6a3.6 3.6 0 0 0 2.6 3.2" />
      <path d="M24 5v4M22 7h4M26.5 13.5v2.6M25.2 14.8h2.6" />
    </Icone>
  )
}

/** Pano dobrado com gotinhas: limpeza com pano úmido */
function IconePano() {
  return (
    <Icone>
      <path d="M5 15.5c3-1.4 6-1.4 9 0s6 1.4 9 0l3.5 8.5c-3 1.4-6 1.4-9 0s-6-1.4-9 0Z" />
      <path d="M8.6 20.6c2.4-.8 4.6-.6 6.8.4" />
      <path d="M12 5.5c-1 1.5-2 2.7-2 3.9a2 2 0 0 0 4 0c0-1.2-1-2.4-2-3.9ZM20 8.5c-.8 1.1-1.5 2-1.5 2.9a1.5 1.5 0 0 0 3 0c0-.9-.7-1.8-1.5-2.9Z" />
    </Icone>
  )
}

/** Chuveiro: vai no banheiro */
function IconeBanheiro() {
  return (
    <Icone>
      <path d="M6 28V9a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
      <path d="M11.5 12.5h9a.5.5 0 0 1 .5.5 4.5 4.5 0 0 1-4.5 4.5h-1A4.5 4.5 0 0 1 11 13a.5.5 0 0 1 .5-.5Z" />
      <path d="M13.5 21v1.5M16 21.5v2M18.5 21v1.5M14.5 25.5v1M17.5 25.5v1" />
    </Icone>
  )
}

/** Canto da sala com o teto marcado e luminária: também no teto */
function IconeTeto() {
  return (
    <Icone>
      <path d="M3.5 9.5 16 4l12.5 5.5" />
      <path d="M3.5 9.5V28M28.5 9.5V28M16 4v0" />
      <path d="M7 10.6 16 6.8l9 3.8" strokeDasharray="1.4 2.2" />
      <path d="M16 9v5" />
      <path d="M12.5 17.5a3.5 3.5 0 0 1 7 0Z" />
    </Icone>
  )
}

const BENEFICIOS = [
  { titulo: "Pode ser lavado", texto: "Sujou? É só limpar.", Icone: IconeLavavel },
  { titulo: "Limpeza com pano úmido", texto: "Sem produtos especiais, sem complicação.", Icone: IconePano },
  // AJUSTAR se o fornecedor restringir a área do box
  { titulo: "Vai no banheiro", texto: "Resiste bem a ambientes úmidos.", Icone: IconeBanheiro },
  { titulo: "Também no teto", texto: "Deixa o ambiente completo, do chão ao teto.", Icone: IconeTeto },
]

/** Itens aparecem com fade + subida de 8px ao entrar na tela (sem JS ou com menos movimento: já visíveis). */
function useRevelar<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const raiz = ref.current
    if (!raiz || !("IntersectionObserver" in window)) return
    raiz.setAttribute("data-revelar", "")
    const itens = Array.from(raiz.querySelectorAll<HTMLElement>("[data-revelar-item]"))
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue
          e.target.setAttribute("data-visivel", "")
          obs.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    )
    itens.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return ref
}

export function AdesivoLavavel() {
  const ref = useRevelar<HTMLElement>()
  return (
    <section
      ref={ref}
      id="adesivo-lavavel"
      tabIndex={-1}
      aria-labelledby="titulo-adesivo"
      data-slot="adesivo-lavavel"
      className="flex scroll-mt-24 flex-col gap-8 outline-none lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[var(--sage)] sm:aspect-[16/9] lg:aspect-[4/5]">
        <Image
          src="/hero/slide-4-mobile.webp"
          alt="Banheiro com papel adesivo verde-sálvia de raminhos na parede e no teto"
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="titulo-adesivo" className="text-3xl md:text-4xl">
            Papel adesivo lavável
          </h2>
          <p className="text-lg text-foreground-subtle">Bonito e prático para o dia a dia.</p>
        </div>

        <ul className="flex flex-col border-t border-border lg:grid lg:grid-cols-2 lg:border-t-0 xl:grid-cols-4">
          {BENEFICIOS.map(({ titulo, texto, Icone }, i) => (
            <li
              key={titulo}
              data-revelar-item
              style={{ animationDelay: `${i * 90}ms` }}
              className={cn(
                "flex items-start gap-4 border-b border-border py-5",
                "lg:flex-col lg:gap-3 lg:border-b-0 lg:border-t lg:py-6 lg:pr-6 xl:border-t-0 xl:border-l xl:py-1 xl:pl-6 xl:first:border-l-0 xl:first:pl-0",
              )}
            >
              <Icone />
              <div className="flex flex-col gap-1">
                <h3 className="font-sans text-lg font-normal text-foreground-heading [font-size-adjust:none]">{titulo}</h3>
                <p className="text-foreground-subtle">{texto}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/produtos?material=adesivo-liso" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto sm:self-start")}>
          Ver estampas em adesivo
        </Link>
      </div>
    </section>
  )
}
