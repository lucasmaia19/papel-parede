import type { Metadata } from "next"
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

// Com generateStaticParams, ler params direto deixa o conteúdo no HTML estático
// (sem <Suspense>, que o mandaria depois do rodapé e faria a página "pular")
export default async function ProdutoPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params
  return <ProdutoDetalhe slug={slug} />
}
