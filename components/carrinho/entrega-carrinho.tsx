"use client"

import { CampoCep } from "@/components/entrega/campo-cep"
import { InfoFrete, ServicosRegiao, type EscolhaServicos } from "@/components/entrega/info-entrega"
import type { ResultadoCep } from "@/lib/cep"
import type { ResumoPreco } from "@/lib/pricing"
import { useLoja } from "@/lib/store"
import type { ItemPedido } from "@/types"

function escolhaGeral(itens: ItemPedido[], campo: "aplicacao" | "visita"): boolean | null {
  if (itens.every((i) => i.servicos[campo])) return true
  if (itens.every((i) => !i.servicos[campo])) return false
  return null
}

/** CEP + serviços da região (para o pedido todo) ou frete. Usado no carrinho e no checkout. */
export function EntregaCarrinho({
  itens,
  resultadoCep,
  resumo,
}: {
  itens: ItemPedido[]
  resultadoCep: ResultadoCep | null
  resumo: ResumoPreco
}) {
  const cep = useLoja((s) => s.cep)
  const definirCep = useLoja((s) => s.definirCep)
  const carrinho = useLoja((s) => s.carrinho)
  const atualizar = useLoja((s) => s.atualizarItemCarrinho)
  const settings = useLoja((s) => s.settings)

  // Na região, a escolha vale para todos os itens. Sem resposta = null (itens com escolhas diferentes)
  const escolha: EscolhaServicos = {
    aplicacao: escolhaGeral(itens, "aplicacao"),
    visita: escolhaGeral(itens, "visita"),
  }

  function alterar(nova: EscolhaServicos) {
    for (const item of carrinho) {
      atualizar(item.id, {
        servicos: {
          aplicacao: nova.aplicacao ?? item.servicos.aplicacao,
          visita: nova.visita ?? item.servicos.visita,
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CampoCep cep={cep} onConfirmar={definirCep} />
      {resultadoCep?.tipo === "atendida" && (
        <ServicosRegiao
          cidade={resultadoCep.cidade.nome}
          escolha={escolha}
          onChange={alterar}
          valorAplicacao={resumo.aplicacaoPossivel}
          valorAplicacaoM2={settings.valorAplicacaoM2}
          valorVisita={settings.valorVisitaMedicao}
          deslocamento={resultadoCep.cidade.taxaDeslocamento}
        />
      )}
      {resultadoCep?.tipo === "frete" && <InfoFrete resultado={resultadoCep} resumo={resumo} />}
    </div>
  )
}
