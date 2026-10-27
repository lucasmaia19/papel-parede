import type { Metadata } from "next"
import { ProdutoEditar } from "@/components/admin/produto-editar"

export const metadata: Metadata = { title: "Novo papel de parede" }

export default function NovoProdutoPage() {
  return <ProdutoEditar id={null} />
}
