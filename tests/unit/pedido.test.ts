import { describe, expect, it } from "vitest"
import { settingsIniciais } from "@/lib/data"
import { calcularPrazo, mensagemOrcamento, montarItensPedido, textoParedes } from "@/lib/pedido"
import { calcularResumo, type LocalEntrega } from "@/lib/pricing"
import type { CartItem } from "@/types"

const item: CartItem = {
  id: "c1",
  produtoId: "p3",
  produtoNome: "Xadrez Vichy",
  produtoSlug: "xadrez-vichy",
  imagem: "/x.svg",
  cor: { nome: "Azul", hex: "#5F84AA" },
  personalizacoes: [{ grupo: "Tamanho do quadrado", opcao: "10 cm", acrescimoM2: 0 }],
  paredes: [{ id: "w", largura: 3.2, altura: 2.6, aberturas: [{ id: "a", tipo: "janela", largura: 1.2, altura: 1 }] }],
  m2: 7.84,
  m2Parede: 7.12,
  precoM2: 80,
  servicos: { aplicacao: true, visita: true },
  simulacao: { tipo: "estampa", observacao: "Trocar o azul por amarelo" },
  prontaEntrega: false,
  prazoProducaoDias: 7,
}

const uberlandia = settingsIniciais.cidadesAtendidas[0]

describe("pedido", () => {
  it("subtotal do item inclui aplicação só na região", () => {
    const naRegiao = montarItensPedido([item], { tipo: "atendida", cidade: uberlandia }, settingsIniciais)
    expect(naRegiao[0].subtotal).toBe(805.2)
    const fora = montarItensPedido([item], { tipo: "frete", regiao: "Sul" }, settingsIniciais)
    expect(fora[0].subtotal).toBe(627.2)
    expect(fora[0].servicos).toEqual({ aplicacao: false, visita: false })
  })

  it("descreve as paredes", () => {
    expect(textoParedes(item)).toBe("3,2 × 2,6 m (menos 1 janela)")
  })

  it("monta a mensagem do WhatsApp com tudo", () => {
    const local: LocalEntrega = { tipo: "atendida", cidade: uberlandia }
    const resumo = calcularResumo([item], local, settingsIniciais)
    const texto = mensagemOrcamento({
      itens: montarItensPedido([item], local, settingsIniciais),
      resumo,
      local,
      cep: "38408-610",
      descontoPixPct: 5,
      nome: "Maria",
    })
    expect(texto).toContain("*1. Xadrez Vichy*")
    expect(texto).toContain("Cor: Azul")
    expect(texto).toContain("Tamanho do quadrado: 10 cm")
    expect(texto).toContain("Metragem: 7,84 m²")
    expect(texto).toContain("Observação (simulação com IA): Trocar o azul por amarelo")
    expect(texto).toContain("Cidade/CEP: Uberlândia - 38408-610")
    expect(texto).toContain("Visita técnica: R$")
    expect(texto.replace(/\s/g, " ")).toContain("*Total: R$ 855,20*")
    expect(texto.replace(/\s/g, " ")).toContain("*No Pix: R$ 812,44*")
    expect(texto).toContain("Nome: Maria")
  })

  it("prazo: produção + transporte fora da região", () => {
    const resumo = calcularResumo([item], { tipo: "frete", regiao: "Sul" }, settingsIniciais)
    expect(calcularPrazo([item], resumo, false).texto).toBe("Até 14 dias úteis: 7 de produção + 7 de transporte.")
    expect(calcularPrazo([{ ...item, prontaEntrega: true }], resumo, false).texto).toBe("Até 7 dias úteis (envio imediato).")
  })
})
