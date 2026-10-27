"use client"

import { ClockIcon, MapPinIcon } from "lucide-react"
import { InstagramIcon } from "@/components/icons"
import { MapaLoja, TaxasDeslocamento } from "@/components/layout/site-footer"
import { buttonVariants } from "@/components/ui/button"
import { WhatsappLink } from "@/components/whatsapp-link"
import { MENSAGEM_AGENDAR_WHATSAPP, MENSAGEM_PADRAO_WHATSAPP, arrobaInstagram, formatarWhatsapp } from "@/lib/contato"
import { useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ContatoPagina() {
  const settings = useLoja((s) => s.settings)
  const cidades = settings.cidadesAtendidas.map((c) => c.nome)

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-10">
        <section aria-labelledby="titulo-fale" className="flex flex-col gap-4">
          <h2 id="titulo-fale" className="text-2xl">
            Fale com a gente
          </h2>
          <p>O jeito mais rápido é pelo WhatsApp. Respondemos em horário comercial.</p>
          <WhatsappLink mensagem={MENSAGEM_PADRAO_WHATSAPP} className="min-h-14 w-full flex-wrap gap-x-2 sm:w-auto sm:self-start">
            WhatsApp <span className="whitespace-nowrap">{formatarWhatsapp(settings.whatsapp)}</span>
          </WhatsappLink>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "min-h-14 w-full [overflow-wrap:anywhere] sm:w-auto sm:self-start")}
          >
            <InstagramIcon className="size-6" />
            {arrobaInstagram(settings.instagram)}
          </a>
        </section>

        <section aria-labelledby="titulo-loja" className="flex flex-col gap-4">
          <h2 id="titulo-loja" className="text-2xl">
            Nossa loja
          </h2>
          <p className="flex gap-2">
            <MapPinIcon className="mt-1 size-5 shrink-0" aria-hidden />
            <span>{settings.endereco}</span>
          </p>
          <p className="flex gap-2 rounded-md border border-border bg-surface-raised p-4 font-medium">
            <ClockIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>{settings.textoAtendimento}</span>
          </p>
          <WhatsappLink variant="outline" mensagem={MENSAGEM_AGENDAR_WHATSAPP} className="w-full sm:w-auto sm:self-start">
            Agendar pelo WhatsApp
          </WhatsappLink>
        </section>

        <section aria-labelledby="titulo-regiao" className="flex flex-col gap-4">
          <h2 id="titulo-regiao" className="text-2xl">
            Entrega e aplicação
          </h2>
          <p>
            Enviamos para todo o Brasil. Aplicamos em {cidades[0] ?? "Uberlândia"} e regiões próximas
            {cidades.length > 1 && <>, como {cidades.slice(1).join(" e ")}</>}. Nessas cidades também fazemos a visita
            técnica para medir a parede.
          </p>
          <TaxasDeslocamento />
        </section>
      </div>

      <section aria-labelledby="titulo-mapa" className="flex flex-col gap-4">
        <h2 id="titulo-mapa" className="text-2xl">
          Como chegar
        </h2>
        <MapaLoja />
      </section>
    </div>
  )
}
