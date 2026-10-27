"use client"

import Link from "next/link"
import { useState } from "react"
import { PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { Calculadora } from "@/components/produto/calculadora"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { paredeFormParaParede, paredeParaForm, textoPersonalizacoes, type ParedeForm } from "@/lib/configurador"
import { textoParedes } from "@/lib/pedido"
import { calcularMetragem, formatarM2, formatarMoeda } from "@/lib/pricing"
import { useLoja } from "@/lib/store"
import type { ItemPedido } from "@/types"

/** Linha de detalhe "Rótulo: valor" */
function Detalhe({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-1.5">
      <dt className="text-foreground-subtle">{rotulo}:</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}

interface ItemCarrinhoProps {
  item: ItemPedido
  naRegiao: boolean
  /** Sem botões de editar/remover (resumo do checkout) */
  somenteLeitura?: boolean
}

export function ItemCarrinho({ item, naRegiao, somenteLeitura }: ItemCarrinhoProps) {
  const settings = useLoja((s) => s.settings)
  const atualizar = useLoja((s) => s.atualizarItemCarrinho)
  const remover = useLoja((s) => s.removerDoCarrinho)
  const [editando, setEditando] = useState(false)
  const [confirmarRemocao, setConfirmarRemocao] = useState(false)
  const [paredes, setParedes] = useState<ParedeForm[]>([])

  const metragemEdicao = calcularMetragem(paredes.map(paredeFormParaParede), settings.margemPerda)

  function abrirEdicao() {
    setParedes(item.paredes.map(paredeParaForm))
    setEditando(true)
  }

  function salvarEdicao() {
    if (metragemEdicao.m2 <= 0) return
    atualizar(item.id, {
      paredes: paredes.map(paredeFormParaParede),
      m2: metragemEdicao.m2,
      m2Parede: metragemEdicao.areaLiquida,
    })
    setEditando(false)
  }

  return (
    <article data-slot="item-carrinho" className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-4">
      <div className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- pode ser base64 */}
        <img src={item.imagem} alt="" className="size-20 shrink-0 rounded-md border border-border object-cover sm:size-28" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="font-sans text-lg leading-snug font-medium">
            <Link href={`/produtos/${item.produtoSlug}`} className="underline-offset-4 hover:underline">
              {item.produtoNome}
            </Link>
          </h3>
          <dl className="flex flex-col gap-0.5">
            <Detalhe rotulo="Cor">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-4 rounded-[2px] border border-foreground/30" style={{ backgroundColor: item.cor.hex }} />
                {item.cor.nome}
              </span>
            </Detalhe>
            {item.personalizacoes.length > 0 && <Detalhe rotulo="Personalização">{textoPersonalizacoes(item.personalizacoes)}</Detalhe>}
            <Detalhe rotulo="Metragem">
              {formatarM2(item.m2)} <span className="font-normal text-foreground-subtle">({textoParedes(item)})</span>
            </Detalhe>
            {naRegiao && <Detalhe rotulo="Aplicação">{item.servicos.aplicacao ? formatarMoeda(item.subtotalAplicacao) : "Não"}</Detalhe>}
          </dl>
        </div>
      </div>

      {item.simulacao && (
        <div className="flex gap-3 rounded-md border border-border bg-muted/60 p-3">
          {item.simulacao.imagem && (
            // eslint-disable-next-line @next/next/no-img-element -- imagem simulada em base64
            <img src={item.simulacao.imagem} alt="Simulação feita com IA" className="size-20 shrink-0 rounded-sm object-cover" />
          )}
          <div className="flex flex-col gap-0.5">
            <p className="flex items-center gap-1.5 font-medium">
              <SparklesIcon className="size-4" aria-hidden />
              Simulação com IA
            </p>
            {item.simulacao.observacao && <p>{item.simulacao.observacao}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p>
          Subtotal: <strong className="text-lg font-medium tabular-nums">{formatarMoeda(item.subtotal)}</strong>
        </p>
        {!somenteLeitura && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={abrirEdicao}>
              <PencilIcon aria-hidden />
              Editar medidas
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmarRemocao(true)}>
              <Trash2Icon aria-hidden />
              Remover <span className="sr-only">{item.produtoNome}</span>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Medidas — {item.produtoNome}</DialogTitle>
          </DialogHeader>
          <Calculadora
            paredes={paredes}
            onChange={setParedes}
            metragem={metragemEdicao}
            margemPerda={settings.margemPerda}
            precoM2={item.precoM2}
          />
          <div className="sticky -bottom-5 -mx-5 flex flex-col gap-2 border-t border-border bg-popover p-5 sm:-bottom-6 sm:-mx-6 sm:p-6">
            <Button size="lg" onClick={salvarEdicao} disabled={metragemEdicao.m2 <= 0}>
              Salvar medidas
            </Button>
            <Button variant="outline" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmarRemocao} onOpenChange={setConfirmarRemocao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover do carrinho?</AlertDialogTitle>
            <AlertDialogDescription>
              {item.produtoNome} — {item.cor.nome}, {formatarM2(item.m2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <Button variant="destructive" onClick={() => remover(item.id)}>
              Sim, remover
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
