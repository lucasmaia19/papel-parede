"use client"

import { useEffect, useRef } from "react"

/**
 * Para barras fixas no rodapé da tela (ex.: barra de preço no celular).
 * Publica a altura da barra em --barra-inferior, para o WhatsApp flutuante subir
 * e para a página reservar espaço no fim (nada fica escondido atrás da barra).
 * Se a barra estiver oculta (display: none no desktop), a altura é 0.
 */
export function useBarraInferior<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const raiz = document.documentElement
    const atualizar = () => raiz.style.setProperty("--barra-inferior", `${el.offsetHeight}px`)
    const obs = new ResizeObserver(atualizar)
    obs.observe(el)
    atualizar()
    return () => {
      obs.disconnect()
      raiz.style.removeProperty("--barra-inferior")
    }
  }, [])
  return ref
}

/** Esconde o WhatsApp flutuante no desktop enquanto a página estiver aberta. */
export function useOcultarWhatsappDesktop() {
  useEffect(() => {
    const raiz = document.documentElement
    raiz.setAttribute("data-ocultar-whatsapp-desktop", "")
    return () => raiz.removeAttribute("data-ocultar-whatsapp-desktop")
  }, [])
}
