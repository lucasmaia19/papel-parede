"use client"

import Link from "next/link"
import { useState } from "react"
import { ProdutoForm } from "@/components/admin/produto-form"
import { buttonVariants } from "@/components/ui/button"
import { produtoParaForm, produtoVazio } from "@/lib/admin-produto"
import { useHidratado, useLoja } from "@/lib/store"

function Novo() {
  const precoPadrao = useLoja((s) => s.settings.precoM2Padrao)
  const [inicial] = useState(() => produtoVazio(precoPadrao))
  return <ProdutoForm inicial={inicial} novo />
}

/** Carrega o formulário só depois de ler o navegador (os dados do admin ficam lá). */
export function ProdutoEditar({ id }: { id: string | null }) {
  const hidratado = useHidratado()
  const produto = useLoja((s) => (id ? s.produtos.find((p) => p.id === id) : undefined))

  if (!hidratado) return <div className="container-loja min-h-[50vh] py-8" aria-busy="true" />
  if (!id) return <Novo />
  if (!produto) {
    return (
      <div className="container-loja flex flex-col items-start gap-4 py-8">
        <h1 className="text-3xl font-semibold">Papel de parede não encontrado</h1>
        <Link href="/admin/produtos" className={buttonVariants()}>
          Voltar para a lista
        </Link>
      </div>
    )
  }
  return <ProdutoForm key={produto.id} inicial={produtoParaForm(produto)} novo={false} />
}
