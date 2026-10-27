"use client"

import { WhatsappLink } from "@/components/whatsapp-link"
import { MENSAGEM_PADRAO_WHATSAPP } from "@/lib/contato"

/**
 * Botão flutuante: só o ícone, círculo de 52 px (toque ≥ 48 px), verde suavizado com ícone creme.
 * Fica 16 px da borda e acima de barras fixas do rodapé (ex.: barra de preço): quem cria a barra
 * define a variável CSS --barra-inferior (ver useBarraInferior). O scroll-padding-bottom do <html>
 * reserva a altura dele, então nada clicável fica embaixo quando a página rola até o elemento.
 * Páginas com botão de WhatsApp próprio num card lateral fixo podem escondê-lo no desktop
 * (ver useOcultarWhatsappDesktop).
 */
export function WhatsappFlutuante() {
  return (
    <WhatsappLink
      mensagem={MENSAGEM_PADRAO_WHATSAPP}
      data-slot="whatsapp-flutuante"
      aria-label="Falar no WhatsApp"
      title="Falar no WhatsApp"
      className="fixed right-4 z-30 size-13 min-h-0 rounded-full border-whatsapp bg-whatsapp p-0 shadow-sm transition-[bottom] hover:border-whatsapp-hover hover:bg-whatsapp-hover lg:[html[data-ocultar-whatsapp-desktop]_&]:hidden [&_svg]:size-[26px] [&_svg]:text-primary-foreground"
      style={{ bottom: "calc(1rem + var(--barra-inferior) + env(safe-area-inset-bottom))" }}
    />
  )
}
