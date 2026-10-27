"use client"

import { useEffect } from "react"
import { useLoja } from "@/lib/store"

/** Lê o store persistido só depois da hidratação, evitando diferença entre servidor e cliente. */
export function StoreHydration() {
  useEffect(() => {
    void useLoja.persist.rehydrate()
  }, [])
  return null
}
