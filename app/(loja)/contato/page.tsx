import type { Metadata } from "next"
import { ContatoPagina } from "@/components/contato/contato-pagina"

export const metadata: Metadata = {
  title: "Contato",
  description: "WhatsApp, Instagram, endereço e mapa da Rodovalho Papéis de Parede em Uberlândia.",
}

export default function ContatoPage() {
  return (
    <div className="container-loja flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl">Contato</h1>
        <p className="max-w-prose text-foreground-subtle">
          Tire dúvidas, peça um orçamento ou agende uma visita à loja.
        </p>
      </header>
      <ContatoPagina />
    </div>
  )
}
