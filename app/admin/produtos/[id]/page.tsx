import type { Metadata } from "next"
import { Suspense } from "react"
import { ProdutoEditar } from "@/components/admin/produto-editar"

export const metadata: Metadata = { title: "Editar papel de parede" }

async function Conteudo({ params }: { params: PageProps<"/admin/produtos/[id]">["params"] }) {
  const { id } = await params
  return <ProdutoEditar id={id} />
}

export default function EditarProdutoPage({ params }: PageProps<"/admin/produtos/[id]">) {
  return (
    <Suspense fallback={<div className="container-loja min-h-[50vh] py-8" aria-busy="true" />}>
      <Conteudo params={params} />
    </Suspense>
  )
}
