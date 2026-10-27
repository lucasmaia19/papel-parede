/** "5534996804044" → "(34) 9 9680-4044" */
export function formatarWhatsapp(numero: string): string {
  const d = numero.replace(/\D/g, "")
  const local = d.startsWith("55") && d.length > 11 ? d.slice(2) : d
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local[2]} ${local.slice(3, 7)}-${local.slice(7)}`
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  }
  return numero
}

export function linkWhatsapp(numero: string, texto?: string): string {
  const base = `https://wa.me/${numero.replace(/\D/g, "")}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}

/** "https://www.instagram.com/rodovalhopapeisdeparede/" → "@rodovalhopapeisdeparede" */
export function arrobaInstagram(url: string): string {
  const usuario = url.replace(/\/+$/, "").split("/").pop() ?? ""
  return usuario ? `@${usuario}` : url
}

export function linkMapa(endereco: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
}

export function linkMapaEmbed(endereco: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`
}

export const MENSAGEM_PADRAO_WHATSAPP = "Olá! Vim pelo site da Rodovalho Papéis de Parede e gostaria de tirar uma dúvida."
export const MENSAGEM_AGENDAR_WHATSAPP =
  "Olá! Gostaria de agendar um horário para atendimento presencial na loja da Rodovalho Papéis de Parede."
