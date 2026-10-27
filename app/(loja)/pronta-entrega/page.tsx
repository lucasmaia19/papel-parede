import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalogo, CatalogoSemFiltros } from "@/components/produto/catalogo"

export const metadata: Metadata = {
  title: "Pronta entrega",
  description: "Papéis de parede texturizados e lisos em Branco e Off-white, com envio imediato.",
}

const props = {
  titulo: "Pronta entrega",
  somenteProntaEntrega: true,
  descricao: (
    <p>
      Papéis que já estão na loja e saem no mesmo dia. Destaque para os{" "}
      <strong className="font-medium text-foreground">texturizados e lisos em Branco e Off-white</strong>, que
      combinam com qualquer ambiente.
    </p>
  ),
}

export default function ProntaEntregaPage() {
  return (
    <Suspense fallback={<CatalogoSemFiltros {...props} />}>
      <Catalogo {...props} />
    </Suspense>
  )
}
