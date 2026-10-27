import type { Metadata } from "next"
import { Suspense } from "react"
import { ProdutoDetalhe } from "@/components/produto/produto-detalhe"
import { produtosIniciais } from "@/lib/data"

// Os produtos de exemplo são gerados no build; os criados no admin, na primeira visita
export function generateStaticParams() {
  return produtosIniciais.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const produto = produtosIniciais.find((p) => p.slug === slug)
  return produto
    ? { title: produto.nome, description: produto.descricao }
    : { title: "Papel de parede" }
}

async function Conteudo({
  params,
  searchParams,
}: Pick<PageProps<"/produtos/[slug]">, "params" | "searchParams">) {
  const [{ slug }, busca] = await Promise.all([params, searchParams])
  // ?previa=1: o admin vê como fica um produto desativado
  return <ProdutoDetalhe slug={slug} previa={busca.previa === "1"} />
}

export default function ProdutoPage({ params, searchParams }: PageProps<"/produtos/[slug]">) {
  return (
    <Suspense fallback={<div className="container-loja min-h-[60vh] py-10" aria-busy="true" />}>
      <Conteudo params={params} searchParams={searchParams} />
    </Suspense>
  )
}
