"use client"

import { calcularPrazo } from "@/lib/pedido"
import { useCarrinhoCalculado } from "@/lib/use-carrinho"
import { useLoja } from "@/lib/store"
import type { CanalPedido, Cliente, Endereco, FormaPagamento, Order } from "@/types"

/**
 * Transforma o carrinho atual em pedido salvo. O carrinho é esvaziado na página
 * de confirmação (concluirPedido), para não piscar "carrinho vazio" antes de navegar.
 */
export function useFinalizarPedido() {
  const calculado = useCarrinhoCalculado()
  const adicionarPedido = useLoja((s) => s.adicionarPedido)

  function finalizar(dados: {
    cliente: Cliente
    endereco: Endereco
    formaPagamento: FormaPagamento
    canal: CanalPedido
  }): Order {
    const { itens, resumo, local } = calculado
    const naRegiao = local?.tipo === "atendida"
    const pix = dados.formaPagamento === "pix"
    const prazo = calcularPrazo(itens, resumo, naRegiao)
    const pedido = adicionarPedido({
      cliente: dados.cliente,
      endereco: dados.endereco,
      itens,
      modalidade: naRegiao && itens.some((i) => i.servicos.aplicacao) ? "aplicacao" : "entrega",
      naRegiao,
      frete: resumo.frete,
      deslocamento: resumo.deslocamento,
      visita: resumo.visita,
      prazoEntregaDias: prazo.entregaDias === null ? null : prazo.producaoDias + prazo.entregaDias,
      prazoTexto: prazo.texto,
      descontoPix: pix ? resumo.descontoPix : 0,
      total: pix ? resumo.totalPix : resumo.total,
      formaPagamento: dados.formaPagamento,
      canal: dados.canal,
      status: "Novo",
      data: new Date().toISOString(),
    })
    return pedido
  }

  return { ...calculado, finalizar }
}
