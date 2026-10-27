import Image from "next/image"
import Link from "next/link"
import { CategoriasHome, Chamada, DestaquesHome, FaixaEntrega, TrabalhosHome } from "@/components/home/home-secoes"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function CabecalhoSecao({ titulo, href, rotuloLink }: { titulo: string; href: string; rotuloLink: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-4">
      <h2 className="text-2xl md:text-3xl">{titulo}</h2>
      <Link href={href} className="inline-flex min-h-12 items-center font-medium underline underline-offset-4 hover:text-primary">
        {rotuloLink}
      </Link>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section aria-labelledby="titulo-home">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[16/7]">
          <Image
            src="/img/home/hero.svg"
            alt="Sala com papel de parede floral em tons de verde atrás de um aparador de madeira"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="container-loja flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between md:gap-12 md:py-12">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-[0.16em] text-foreground-subtle uppercase">Uberlândia — MG</p>
            <h1 id="titulo-home" className="text-[2.1rem] leading-[1.1] md:text-5xl">
              Papel de parede escolhido com calma, feito sob medida
            </h1>
            <p className="max-w-prose text-foreground-subtle md:text-lg">
              Escolha a estampa e a cor, informe as medidas da parede e veja o preço na hora.
            </p>
          </div>
          <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }), "w-full shrink-0 md:w-auto")}>
            Ver papéis de parede
          </Link>
        </div>
      </section>

      <FaixaEntrega />

      <div className="container-loja flex flex-col gap-16 py-12 md:gap-24 md:py-20">
        <div className="flex flex-col gap-14 md:gap-20">
          <Chamada
            titulo="Calcule seu papel de parede"
            texto="Informe a largura e a altura de cada parede. A gente desconta portas e janelas, soma uma pequena sobra para recortes e mostra o preço na hora."
            href="/produtos"
            rotuloLink="Escolher e calcular"
            imagem="/img/home/medir.svg"
            alt="Sala com papel listrado azul e um sofá verde"
          />
          <Chamada
            titulo="Veja na sua parede"
            texto="Tire uma foto da sua parede e veja uma simulação de como ela fica com o papel escolhido, antes de comprar."
            href="/produtos/borboletas"
            rotuloLink="Experimentar com as Borboletas"
            imagem="/img/produtos/borboletas-ambiente.svg"
            alt="Parede com papel de borboletas azuis atrás de um aparador"
            invertida
          />
          <Chamada
            titulo="Pronta entrega"
            texto="Texturizados e lisos em Branco e Off-white, já na loja e com envio imediato."
            href="/pronta-entrega"
            rotuloLink="Ver pronta entrega"
            imagem="/img/produtos/texturizado-linho-ambiente.svg"
            alt="Sala com papel texturizado linho branco e um sofá"
          />
        </div>

        <section aria-labelledby="titulo-estilos" className="flex flex-col gap-6">
          <h2 id="titulo-estilos" className="border-b border-border pb-4 text-2xl md:text-3xl">
            Escolha pelo estilo
          </h2>
          <CategoriasHome />
        </section>

        <section className="flex flex-col gap-6">
          <CabecalhoSecao titulo="Mais procurados" href="/produtos" rotuloLink="Ver todos os papéis" />
          <DestaquesHome />
        </section>

        <section className="flex flex-col gap-6">
          <CabecalhoSecao titulo="Trabalhos realizados" href="/trabalhos" rotuloLink="Ver antes e depois" />
          <TrabalhosHome />
        </section>
      </div>
    </div>
  )
}
