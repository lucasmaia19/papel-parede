"use client"

import { useSyncExternalStore } from "react"

const CHAVE_SEMENTE = "rodovalho:semente-ordem"
const CHAVE_AMBIENTE = "rodovalho:ultimo-ambiente"
const semAssinatura = () => () => {}

let semente: number | null = null

function lerSemente(): number {
  if (semente !== null) return semente
  try {
    const salva = Number(sessionStorage.getItem(CHAVE_SEMENTE))
    semente = salva > 0 ? salva : Math.floor(Math.random() * 2 ** 31) + 1
    sessionStorage.setItem(CHAVE_SEMENTE, String(semente))
  } catch {
    semente = Math.floor(Math.random() * 2 ** 31) + 1
  }
  return semente
}

/**
 * Semente da ordem aleatória do catálogo: sorteada uma vez por sessão (sessionStorage),
 * para os papéis não mudarem de lugar a cada toque. No servidor é null (ordem do cadastro).
 */
export function useSementeSessao(): number | null {
  return useSyncExternalStore(semAssinatura, lerSemente, () => null)
}

/** Guarda o último ambiente filtrado (query string), para a mensagem de WhatsApp do produto. */
export function salvarUltimoAmbiente(busca: string) {
  try {
    if (busca) sessionStorage.setItem(CHAVE_AMBIENTE, busca)
    else sessionStorage.removeItem(CHAVE_AMBIENTE)
  } catch {
    // ignora
  }
}

function lerUltimoAmbiente(): string {
  try {
    return sessionStorage.getItem(CHAVE_AMBIENTE) ?? ""
  } catch {
    return ""
  }
}

export function useUltimoAmbiente(): string {
  return useSyncExternalStore(semAssinatura, lerUltimoAmbiente, () => "")
}
