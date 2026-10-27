import type { Metadata } from "next"
import { Suspense } from "react"
import { PedidoConfirmado } from "@/components/carrinho/pedido-confirmado"

export const metadata: Metadata = { title: "Pedido confirmado" }

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={<div className="container-loja min-h-[50vh] py-10" aria-busy="true" />}>
      <PedidoConfirmado />
    </Suspense>
  )
}
