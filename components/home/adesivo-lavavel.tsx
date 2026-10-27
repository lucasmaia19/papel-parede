"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { IconeBanheiro, IconeLavavel, IconePano, IconeTeto } from "@/components/icones-adesivo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
              <Icone className="size-9 shrink-0 text-foreground-heading" />
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
