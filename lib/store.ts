"use client"

import { useSyncExternalStore } from "react"
import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { produtosIniciais, settingsIniciais, trabalhosIniciais } from "@/lib/data"
import type { CartItem, Order, Product, Settings, StatusPedido, WorkGallery } from "@/types"

export function gerarId(prefixo = ""): string {
  return `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

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
  trabalhos: WorkGallery[]
  settings: Settings
  pedidos: Order[]
  carrinho: CartItem[]
  /** Último CEP informado (compartilhado entre produto, carrinho e checkout) */
  cep: string
  simulacoesUsadas: number

  salvarProduto: (produto: Product) => void
  duplicarProduto: (id: string) => Product | null
  alternarAtivoProduto: (id: string) => void
  excluirProduto: (id: string) => void

  salvarTrabalho: (trabalho: WorkGallery) => void
  excluirTrabalho: (id: string) => void
  moverTrabalho: (id: string, direcao: -1 | 1) => void

  salvarSettings: (settings: Settings) => void

  adicionarPedido: (pedido: Omit<Order, "id" | "numero">) => Order
  alterarStatusPedido: (id: string, status: StatusPedido) => void

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
  trabalhos: trabalhosIniciais,
  settings: settingsIniciais,
  pedidos: [] as Order[],
  carrinho: [] as CartItem[],
  cep: "",
  simulacoesUsadas: 0,
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
        set((s) => ({ pedidos: [pedido, ...s.pedidos] }))
        return pedido
      },
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
      version: 1,
      storage: createJSONStorage(() => armazenamentoSeguro),
      // Só lê o localStorage no cliente, depois da hidratação do React (ver <StoreHydration />)
      skipHydration: true,
      partialize: (s) => ({
        produtos: s.produtos,
        trabalhos: s.trabalhos,
        settings: s.settings,
        pedidos: s.pedidos,
        carrinho: s.carrinho,
        cep: s.cep,
        simulacoesUsadas: s.simulacoesUsadas,
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
