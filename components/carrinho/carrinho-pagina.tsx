"use client"

import Link from "next/link"
import { ShoppingBagIcon } from "lucide-react"
import { EntregaCarrinho } from "@/components/carrinho/entrega-carrinho"
import { FinalizarWhatsapp } from "@/components/carrinho/finalizar-whatsapp"
import { ItemCarrinho } from "@/components/carrinho/item-carrinho"
import { ResumoPrecoLista } from "@/components/entrega/resumo-preco"
import { buttonVariants } from "@/components/ui/button"
import { useCarrinhoCalculado } from "@/lib/use-carrinho"
import { cn } from "@/lib/utils"

export function CarrinhoPagina() {
  const { hidratado, itens, resumo, local, resultadoCep, settings } = useCarrinhoCalculado()

  if (!hidratado) {
    return <div className="container-loja min-h-[50vh] py-10" aria-busy="true" />
  }

  if (itens.length === 0) {
    return (
      <div className="container-loja flex flex-col items-start gap-5 py-12">
        <h1 className="text-3xl md:text-4xl">Seu carrinho está vazio</h1>
        <p className="text-foreground-subtle">Escolha um papel de parede, informe as medidas e ele aparece aqui.</p>
        <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
          <ShoppingBagIcon aria-hidden />
          Ver papéis de parede
        </Link>
      </div>
    )
  }

  const naRegiao = local?.tipo === "atendida"

  return (
    <div className="container-loja flex flex-col gap-6 py-8 md:py-12">
      <h1 className="border-b border-border pb-5 text-3xl md:text-4xl">Seu carrinho</h1>

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="titulo-itens" className="flex flex-col gap-4">
            <h2 id="titulo-itens" className="text-xl">
              {itens.length} {itens.length === 1 ? "item" : "itens"}
            </h2>
            <ul className="flex flex-col gap-4">
              {itens.map((item) => (
                <li key={item.id}>
                  <ItemCarrinho item={item} naRegiao={naRegiao} />
                </li>
              ))}
            </ul>
            <Link href="/produtos" className="inline-flex min-h-12 items-center self-start font-medium underline underline-offset-4">
              Continuar comprando
            </Link>
          </section>

          <section aria-labelledby="titulo-entrega" className="flex flex-col gap-4 border-t border-border pt-6">
            <h2 id="titulo-entrega" className="text-xl">
              Entrega ou aplicação
            </h2>
            <EntregaCarrinho itens={itens} resultadoCep={resultadoCep} resumo={resumo} />
          </section>
        </div>

        <aside aria-labelledby="titulo-resumo" className="lg:sticky lg:top-24">
          <div className="flex flex-col gap-5 rounded-md border border-border bg-surface-raised p-5">
            <h2 id="titulo-resumo" className="text-xl">
              Resumo
            </h2>
            <ResumoPrecoLista resumo={resumo} local={local} descontoPixPct={settings.descontoPix} rotuloPapel="Papéis de parede" />
            <div className="flex flex-col gap-3">
              <p className="font-medium">Como prefere finalizar?</p>
              <Link href="/checkout" className={cn(buttonVariants(), "min-h-14 w-full")}>
                Finalizar compra no site
              </Link>
              <FinalizarWhatsapp />
              <p className="text-sm text-foreground-subtle">
                Pelo WhatsApp, a loja recebe seu orçamento completo e combina o pagamento com você.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
