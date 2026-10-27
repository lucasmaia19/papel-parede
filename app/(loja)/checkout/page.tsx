import type { Metadata } from "next"
import { CheckoutPagina } from "@/components/carrinho/checkout-pagina"

export const metadata: Metadata = { title: "Finalizar compra" }

export default function CheckoutPage() {
  return <CheckoutPagina />
}
