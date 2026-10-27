import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalogo, CatalogoSemFiltros } from "@/components/produto/catalogo"

export const metadata: Metadata = {
  title: "Papéis de parede",
  description: "Listrados, quadriculados, florais, infantis, texturizados e lisos. Preço por m², sob medida.",
}

const props = {
  titulo: "Papéis de parede",
  descricao: "Escolha um estilo e uma cor. Em cada papel você informa as medidas da parede e vê o preço na hora.",
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<CatalogoSemFiltros {...props} />}>
      <Catalogo {...props} />
    </Suspense>
  )
}
