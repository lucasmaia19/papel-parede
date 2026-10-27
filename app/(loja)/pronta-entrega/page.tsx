import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalogo, CatalogoSemFiltros } from "@/components/produto/catalogo"

export const metadata: Metadata = {
  title: "Pronta entrega",
  description: "Linho com textura nas cores branco e off-white (sem estampa), já na loja e com envio imediato.",
}

const props = {
  titulo: "Pronta entrega",
  somenteProntaEntrega: true,
  descricao: (
    <p>
      <strong className="font-medium text-foreground">
        Linho com textura nas cores branco e off-white (sem estampa)
      </strong>
      , já na loja e com envio imediato. Combina com qualquer ambiente.
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
