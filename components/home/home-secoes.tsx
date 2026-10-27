"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { GradeProdutos } from "@/components/produto/produto-card"
import { buttonVariants } from "@/components/ui/button"
import { ROTULO_CATEGORIA } from "@/lib/data"
import { categoriasDisponiveis, imagemPrincipal } from "@/lib/catalogo"
import { useLoja, useProdutosAtivos } from "@/lib/store"
import { cn } from "@/lib/utils"

export function FaixaEntrega() {
  const cidades = useLoja((s) => s.settings.cidadesAtendidas.map((c) => c.nome).join(", "))
  return (
    <p
      data-slot="faixa-entrega"
      className="border-y border-border bg-surface px-4 py-4 text-center text-base font-medium md:text-lg"
    >
      Enviamos para todo o Brasil <span aria-hidden className="mx-2 hidden text-foreground-subtle sm:inline">•</span>
      <br className="sm:hidden" />
      Aplicamos em {cidades} e região
    </p>
  )
}

export function CategoriasHome() {
  const produtos = useProdutosAtivos()
  const categorias = categoriasDisponiveis(produtos)
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {categorias.map((c) => {
        const produto = produtos.find((p) => p.categoria === c)!
        return (
          <li key={c}>
            <Link
              href={`/produtos?categoria=${c}`}
              className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface-raised outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              <span className="relative block aspect-[3/2] overflow-hidden bg-muted">
                <Image
                  src={imagemPrincipal(produto)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 14vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="flex min-h-12 items-center justify-between gap-2 px-3 py-2 font-semibold">
                {ROTULO_CATEGORIA[c]}
                <ArrowRightIcon className="size-4 shrink-0 text-foreground-subtle" aria-hidden />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function DestaquesHome() {
  const produtos = useProdutosAtivos()
  const destaques = [...produtos.filter((p) => !p.prontaEntrega), ...produtos.filter((p) => p.prontaEntrega)].slice(0, 4)
  return <GradeProdutos produtos={destaques} />
}

export function TrabalhosHome() {
  const trabalhos = useLoja((s) => s.trabalhos)
  const lista = [...trabalhos.filter((t) => t.destaque), ...trabalhos.filter((t) => !t.destaque)].slice(0, 2)
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {lista.map((t) => (
        <li key={t.id}>
          <figure className="flex flex-col gap-3">
            <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-border bg-muted">
              <Image src={t.fotoDepois} alt={`Depois: ${t.titulo}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <figcaption>
              <span className="font-semibold">{t.titulo}</span>
              <span className="text-foreground-subtle"> — {t.cidade}</span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}

interface ChamadaProps {
  titulo: string
  texto: string
  href: string
  rotuloLink: string
  imagem: string
  alt: string
  invertida?: boolean
}

export function Chamada({ titulo, texto, href, rotuloLink, imagem, alt, invertida }: ChamadaProps) {
  return (
    <section
      data-slot="chamada"
      className="grid items-center gap-5 md:grid-cols-2 md:gap-12"
    >
      <div className={cn("relative aspect-[4/3] overflow-hidden rounded-md bg-muted", invertida && "md:order-2")}>
        <Image src={imagem} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold md:text-4xl">{titulo}</h2>
        <p className="max-w-prose text-foreground-subtle md:text-lg">{texto}</p>
        <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto sm:self-start")}>
          {rotuloLink}
          <ArrowRightIcon aria-hidden />
        </Link>
      </div>
    </section>
  )
}
