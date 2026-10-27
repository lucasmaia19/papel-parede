import type { Metadata } from "next"
import { CarrinhoPagina } from "@/components/carrinho/carrinho-pagina"

export const metadata: Metadata = { title: "Carrinho" }

export default function CarrinhoPage() {
  return <CarrinhoPagina />
}
