"use client"

import { useSyncExternalStore } from "react"

const consulta = "(prefers-reduced-motion: reduce)"

function assinar(aoMudar: () => void) {
  const mq = window.matchMedia(consulta)
  mq.addEventListener("change", aoMudar)
  return () => mq.removeEventListener("change", aoMudar)
}

/** A pessoa pediu menos movimento no sistema? (no servidor: não) */
export function useMovimentoReduzido(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}
