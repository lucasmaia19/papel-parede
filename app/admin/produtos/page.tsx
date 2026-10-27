import type { Metadata } from "next"
import { ProdutosLista } from "@/components/admin/produtos-lista"

export const metadata: Metadata = { title: "Papéis de parede" }

export default function AdminProdutosPage() {
  return <ProdutosLista />
}
