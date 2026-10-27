"use client"

import { useResultadoCep } from "@/components/entrega/campo-cep"
import { itemParaCalculo, localDoCep, montarItensPedido } from "@/lib/pedido"
import { calcularResumo } from "@/lib/pricing"
import { useHidratado, useLoja } from "@/lib/store"

/** Carrinho com frete/serviços/total recalculados pelo CEP salvo. */
export function useCarrinhoCalculado() {
  const hidratado = useHidratado()
  const carrinho = useLoja((s) => s.carrinho)
  const settings = useLoja((s) => s.settings)
  const cep = useLoja((s) => s.cep)
  const resultadoCep = useResultadoCep(cep)
  const local = localDoCep(resultadoCep)
  const resumo = calcularResumo(carrinho.map(itemParaCalculo), local, settings)
  const itens = montarItensPedido(carrinho, local, settings)
  return { hidratado, carrinho, itens, settings, cep, resultadoCep, local, resumo }
}
