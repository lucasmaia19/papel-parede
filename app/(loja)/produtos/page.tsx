import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalogo } from "@/components/produto/catalogo"
import { CarregandoCatalogo } from "@/components/produto/carregando-catalogo"

export const metadata: Metadata = {
  title: "Papéis de parede",
  description: "Listrados, quadriculados, florais, infantis, texturizados e lisos. Preço por m², sob medida.",
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<CarregandoCatalogo titulo="Papéis de parede" />}>
      <Catalogo
        titulo="Papéis de parede"
        descricao="Escolha um estilo e uma cor. Em cada papel você informa as medidas da parede e vê o preço na hora."
      />
    </Suspense>
  )
}
