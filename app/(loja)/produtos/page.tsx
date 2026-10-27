import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalogo, CatalogoSemFiltros } from "@/components/produto/catalogo"

export const metadata: Metadata = {
  title: "Papéis de parede",
  description: "Listrados, quadriculados, florais, infantis, linho texturizado e lisos. Preço por m², sob medida.",
}

const props = {
  titulo: "Papéis de parede",
  descricao: "Escolha o ambiente e, se quiser, o estilo e a cor. Em cada papel você informa as medidas da parede e vê o preço na hora.",
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<CatalogoSemFiltros {...props} />}>
      <Catalogo {...props} />
    </Suspense>
  )
}
