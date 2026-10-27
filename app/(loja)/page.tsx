import Link from "next/link"
import { AdesivoLavavel } from "@/components/home/adesivo-lavavel"
import { HeroCarrossel } from "@/components/home/hero-carrossel"
import { AmbientesHome, CategoriasHome, Chamada, DestaquesHome, FaixaEntrega, TrabalhosHome } from "@/components/home/home-secoes"

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
      <HeroCarrossel />

      <FaixaEntrega />

      <div className="container-loja flex flex-col gap-16 py-12 md:gap-24 md:py-20">
        <AmbientesHome />

        <div className="flex flex-col gap-14 md:gap-20">
          <Chamada
            titulo="Calcule seu papel de parede"
            texto="Informe a largura e a altura de cada parede. A gente desconta portas e janelas, soma uma pequena sobra para recortes e mostra o preço na hora."
            href="/produtos"
            rotuloLink="Escolher e calcular"
            imagem="/img/produtos/listra-e-flores-2.webp"
            alt="Quarto com papel de listras e flores atrás de uma cabeceira cinza"
          />
          <Chamada
            titulo="Veja na sua parede"
            texto="Tire uma foto da sua parede e veja uma simulação de como ela fica com o papel escolhido, antes de comprar."
            href="/produtos/lacos-e-flores"
            rotuloLink="Experimentar com Laços e Flores"
            imagem="/img/produtos/lacos-e-flores.webp"
            alt="Parede com papel de laços rosa e flores atrás de um espelho oval"
            invertida
          />
        </div>

        <section aria-labelledby="titulo-estilos" className="flex flex-col gap-6">
          <h2 id="titulo-estilos" className="border-b border-border pb-4 text-2xl md:text-3xl">
            Escolha pelo estilo
          </h2>
          <CategoriasHome />
        </section>

        <AdesivoLavavel />

        <Chamada
          titulo="Pronta entrega"
          texto="Linho com textura nas cores branco e off-white (sem estampa), já na loja e com envio imediato."
          href="/pronta-entrega"
          rotuloLink="Ver pronta entrega"
          imagem="/img/produtos/linho-texturizado-off-white.webp"
          alt="Papel de linho texturizado off-white, sem estampa"
        />

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
