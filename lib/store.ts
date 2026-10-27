"use client"

import { useSyncExternalStore } from "react"
import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { removerReferencia } from "@/lib/ambientes"
import { ambientesIniciais, produtosIniciais, settingsIniciais, trabalhosIniciais } from "@/lib/data"
import { gerarIdSimples as gerarId } from "@/lib/id"
import { comMateriais } from "@/lib/materiais"
import type { Ambiente, CartItem, Order, Product, Settings, StatusPedido, WorkGallery } from "@/types"


export const EVENTO_ARMAZENAMENTO_CHEIO = "rodovalho:armazenamento-cheio"

/** localStorage que não derruba a página quando enche (imagens em base64 ocupam espaço). */
const armazenamentoSeguro: StateStorage = {
  getItem: (nome) => {
    try {
      return localStorage.getItem(nome)
    } catch {
      return null
    }
  },
  setItem: (nome, valor) => {
    try {
      localStorage.setItem(nome, valor)
    } catch (erro) {
      console.warn("Não foi possível salvar no navegador:", erro)
      window.dispatchEvent(new Event(EVENTO_ARMAZENAMENTO_CHEIO))
    }
  },
  removeItem: (nome) => {
    try {
      localStorage.removeItem(nome)
    } catch {
      // ignora
    }
  },
}

interface LojaState {
  produtos: Product[]
  /** Taxonomia do filtro "Para qual ambiente?" (fonte de verdade da loja) */
  ambientes: Ambiente[]
  trabalhos: WorkGallery[]
  settings: Settings
  pedidos: Order[]
  carrinho: CartItem[]
  /** Último CEP informado (compartilhado entre produto, carrinho e checkout) */
  cep: string
  simulacoesUsadas: number
  /** Pedido recém-criado cujo carrinho ainda não foi esvaziado (a confirmação esvazia) */
  pedidoAguardandoLimpeza: string | null

  salvarProduto: (produto: Product) => void
  duplicarProduto: (id: string) => Product | null
  alternarAtivoProduto: (id: string) => void
  excluirProduto: (id: string) => void

  /** Salva o ambiente; opções e perguntas removidas saem também dos papéis */
  salvarAmbiente: (ambiente: Ambiente) => void
  /** Exclui o ambiente e tira a referência dele dos papéis */
  excluirAmbiente: (id: string) => void
  moverAmbiente: (id: string, direcao: -1 | 1) => void
  alternarAtivoAmbiente: (id: string) => void

  salvarTrabalho: (trabalho: WorkGallery) => void
  excluirTrabalho: (id: string) => void
  moverTrabalho: (id: string, direcao: -1 | 1) => void

  salvarSettings: (settings: Settings) => void

  adicionarPedido: (pedido: Omit<Order, "id" | "numero">) => Order
  alterarStatusPedido: (id: string, status: StatusPedido) => void
  /** Esvazia o carrinho se ele pertence ao pedido recém-confirmado */
  concluirPedido: (id: string) => void

  adicionarAoCarrinho: (item: Omit<CartItem, "id">) => void
  atualizarItemCarrinho: (id: string, item: Partial<CartItem>) => void
  removerDoCarrinho: (id: string) => void
  limparCarrinho: () => void

  definirCep: (cep: string) => void
  registrarSimulacao: () => void
  restaurarDadosDeExemplo: () => void
}

const dadosIniciais = () => ({
  produtos: produtosIniciais,
  ambientes: ambientesIniciais,
  trabalhos: trabalhosIniciais,
  settings: settingsIniciais,
  pedidos: [] as Order[],
  carrinho: [] as CartItem[],
  cep: "",
  simulacoesUsadas: 0,
  pedidoAguardandoLimpeza: null as string | null,
})

export const useLoja = create<LojaState>()(
  persist(
    (set, get) => ({
      ...dadosIniciais(),

      salvarProduto: (produto) =>
        set((s) => {
          const existe = s.produtos.some((p) => p.id === produto.id)
          return {
            produtos: existe
              ? s.produtos.map((p) => (p.id === produto.id ? produto : p))
              : [...s.produtos, produto],
          }
        }),
      duplicarProduto: (id) => {
        const original = get().produtos.find((p) => p.id === id)
        if (!original) return null
        const novoId = gerarId("p")
        const copia: Product = {
          ...structuredClone(original),
          id: novoId,
          nome: `${original.nome} (cópia)`,
          slug: `${original.slug}-copia-${novoId.slice(-4)}`,
          ativo: false,
        }
        set((s) => ({ produtos: [...s.produtos, copia] }))
        return copia
      },
      alternarAtivoProduto: (id) =>
        set((s) => ({ produtos: s.produtos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)) })),
      excluirProduto: (id) => set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) })),

      salvarAmbiente: (ambiente) =>
        set((s) => {
          const anterior = s.ambientes.find((a) => a.id === ambiente.id)
          const opcoesAgora = new Set(ambiente.grupos.flatMap((g) => g.opcoes.map((o) => o.id)))
          const removidas = (anterior?.grupos ?? []).flatMap((g) => g.opcoes.map((o) => o.id)).filter((id) => !opcoesAgora.has(id))
          return {
            ambientes: anterior
              ? s.ambientes.map((a) => (a.id === ambiente.id ? ambiente : a))
              : [...s.ambientes, { ...ambiente, ordem: Math.max(0, ...s.ambientes.map((a) => a.ordem)) + 1 }],
            produtos: removidas.length ? s.produtos.map((p) => removerReferencia(p, ambiente.id, removidas)) : s.produtos,
          }
        }),
      excluirAmbiente: (id) =>
        set((s) => ({
          ambientes: s.ambientes.filter((a) => a.id !== id),
          produtos: s.produtos.map((p) => removerReferencia(p, id)),
        })),
      moverAmbiente: (id, direcao) =>
        set((s) => {
          const lista = [...s.ambientes].sort((a, b) => a.ordem - b.ordem)
          const i = lista.findIndex((a) => a.id === id)
          const j = i + direcao
          if (i < 0 || j < 0 || j >= lista.length) return s
          ;[lista[i], lista[j]] = [lista[j], lista[i]]
          return { ambientes: lista.map((a, k) => ({ ...a, ordem: k + 1 })) }
        }),
      alternarAtivoAmbiente: (id) =>
        set((s) => ({ ambientes: s.ambientes.map((a) => (a.id === id ? { ...a, ativo: !a.ativo } : a)) })),

      salvarTrabalho: (trabalho) =>
        set((s) => {
          const existe = s.trabalhos.some((t) => t.id === trabalho.id)
          return {
            trabalhos: existe
              ? s.trabalhos.map((t) => (t.id === trabalho.id ? trabalho : t))
              : [...s.trabalhos, trabalho],
          }
        }),
      excluirTrabalho: (id) => set((s) => ({ trabalhos: s.trabalhos.filter((t) => t.id !== id) })),
      moverTrabalho: (id, direcao) =>
        set((s) => {
          const i = s.trabalhos.findIndex((t) => t.id === id)
          const j = i + direcao
          if (i < 0 || j < 0 || j >= s.trabalhos.length) return s
          const lista = [...s.trabalhos]
          ;[lista[i], lista[j]] = [lista[j], lista[i]]
          return { trabalhos: lista }
        }),

      salvarSettings: (settings) => set({ settings }),

      adicionarPedido: (dados) => {
        const numero = get().pedidos.reduce((max, p) => Math.max(max, p.numero), 1000) + 1
        const pedido: Order = { ...dados, id: gerarId("o"), numero }
        set((s) => ({ pedidos: [pedido, ...s.pedidos], pedidoAguardandoLimpeza: pedido.id }))
        return pedido
      },
      concluirPedido: (id) =>
        set((s) => (s.pedidoAguardandoLimpeza === id ? { carrinho: [], pedidoAguardandoLimpeza: null } : s)),
      alterarStatusPedido: (id, status) =>
        set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status } : p)) })),

      adicionarAoCarrinho: (item) => set((s) => ({ carrinho: [...s.carrinho, { ...item, id: gerarId("c") }] })),
      atualizarItemCarrinho: (id, item) =>
        set((s) => ({ carrinho: s.carrinho.map((c) => (c.id === id ? { ...c, ...item } : c)) })),
      removerDoCarrinho: (id) => set((s) => ({ carrinho: s.carrinho.filter((c) => c.id !== id) })),
      limparCarrinho: () => set({ carrinho: [] }),

      definirCep: (cep) => set({ cep }),
      registrarSimulacao: () => set((s) => ({ simulacoesUsadas: s.simulacoesUsadas + 1 })),
      restaurarDadosDeExemplo: () =>
        set((s) => ({
          ...dadosIniciais(),
          // O carrinho e o CEP do visitante não são dados de exemplo
          carrinho: s.carrinho,
          cep: s.cep,
        })),
    }),
    {
      name: "rodovalho-loja",
      // v2: produtos ganharam "materiais" (texturizado / adesivo)
      // v3: produtos e trabalhos de exemplo trocados pelas fotos reais da loja
      // v4: ambientes (taxonomia do filtro) e Product.ambientes
      version: 4,
      migrate: (salvo, versao) => {
        const estado = salvo as Partial<LojaState>
        if (versao < 2 && Array.isArray(estado.produtos)) {
          estado.produtos = estado.produtos.map(comMateriais)
        }
        if (versao < 3) {
          estado.produtos = produtosIniciais
          estado.trabalhos = trabalhosIniciais
        }
        if (versao < 4) {
          estado.ambientes = ambientesIniciais
          // Papéis de exemplo recebem os ambientes sorteados; os criados no admin ficam "Sem ambiente"
          estado.produtos = (estado.produtos ?? produtosIniciais).map((p) => ({
            ...p,
            ambientes: p.ambientes ?? produtosIniciais.find((x) => x.id === p.id)?.ambientes ?? [],
          }))
        }
        return estado as LojaState
      },
      storage: createJSONStorage(() => armazenamentoSeguro),
      // Só lê o localStorage no cliente, depois da hidratação do React (ver <StoreHydration />)
      skipHydration: true,
      partialize: (s) => ({
        produtos: s.produtos,
        ambientes: s.ambientes,
        trabalhos: s.trabalhos,
        settings: s.settings,
        pedidos: s.pedidos,
        carrinho: s.carrinho,
        cep: s.cep,
        simulacoesUsadas: s.simulacoesUsadas,
        pedidoAguardandoLimpeza: s.pedidoAguardandoLimpeza,
      }),
    },
  ),
)

function assinarHidratacao(callback: () => void) {
  return useLoja.persist.onFinishHydration(callback)
}

/** true depois que o store persistido foi lido do localStorage. No servidor é sempre false. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    assinarHidratacao,
    () => useLoja.persist.hasHydrated(),
    () => false,
  )
}

export function useProdutosAtivos(): Product[] {
  return useLoja((s) => s.produtos).filter((p) => p.ativo)
}
