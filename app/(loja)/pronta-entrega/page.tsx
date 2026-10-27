import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalogo } from "@/components/produto/catalogo"
import { CarregandoCatalogo } from "@/components/produto/carregando-catalogo"

export const metadata: Metadata = {
  title: "Pronta entrega",
  description: "Papéis de parede texturizados e lisos em Branco e Off-white, com envio imediato.",
}

export default function ProntaEntregaPage() {
  return (
    <Suspense fallback={<CarregandoCatalogo titulo="Pronta entrega" />}>
      <Catalogo
        titulo="Pronta entrega"
        somenteProntaEntrega
        descricao={
          <>
            <p>
              Papéis que já estão na loja e saem no mesmo dia. Destaque para os{" "}
              <strong className="font-semibold text-foreground">texturizados e lisos em Branco e Off-white</strong>,
              que combinam com qualquer ambiente.
            </p>
          </>
        }
      />
    </Suspense>
  )
}
