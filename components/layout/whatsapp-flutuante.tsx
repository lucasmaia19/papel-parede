"use client"

import { WhatsappLink } from "@/components/whatsapp-link"
import { MENSAGEM_PADRAO_WHATSAPP } from "@/lib/contato"

/**
 * Botão flutuante. Fica acima de barras fixas do rodapé (ex.: barra de preço):
 * quem cria a barra define a variável CSS --barra-inferior (ver useBarraInferior).
 * Páginas com botão de WhatsApp próprio num card lateral fixo podem escondê-lo no desktop
 * (ver useOcultarWhatsappDesktop), para não cobrir esse card.
 */
export function WhatsappFlutuante() {
  return (
    <WhatsappLink
      mensagem={MENSAGEM_PADRAO_WHATSAPP}
      size="lg"
      data-slot="whatsapp-flutuante"
      aria-label="Conversar pelo WhatsApp"
      className="fixed right-4 z-30 min-h-14 px-5 shadow-lg transition-[bottom] md:right-6 lg:[html[data-ocultar-whatsapp-desktop]_&]:hidden"
      style={{ bottom: "calc(1rem + var(--barra-inferior) + env(safe-area-inset-bottom))" }}
    >
      WhatsApp
    </WhatsappLink>
  )
}
