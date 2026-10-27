"use client"

import Link from "next/link"
import { ClockIcon, MapPinIcon } from "lucide-react"
import { InstagramIcon } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { WhatsappLink } from "@/components/whatsapp-link"
import { LINKS_MENU, Logo } from "@/components/layout/site-header"
import {
  MENSAGEM_AGENDAR_WHATSAPP,
  arrobaInstagram,
  formatarWhatsapp,
  linkMapa,
  linkMapaEmbed,
} from "@/lib/contato"
import { formatarMoeda } from "@/lib/pricing"
import { useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"

export function TaxasDeslocamento({ className }: { className?: string }) {
  const cidades = useLoja((s) => s.settings.cidadesAtendidas)
  return (
    <ul data-slot="taxas-deslocamento" className={cn("divide-y divide-border border-y border-border", className)}>
      {cidades.map((c) => (
        <li key={c.id} className="flex items-baseline justify-between gap-4 py-2.5">
          <span>{c.nome}</span>
          <span className="font-semibold">
            {c.taxaDeslocamento > 0 ? `${formatarMoeda(c.taxaDeslocamento)} de deslocamento` : "Sem taxa de deslocamento"}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function MapaLoja({ className }: { className?: string }) {
  const endereco = useLoja((s) => s.settings.endereco)
  return (
    <div data-slot="mapa-loja" className={cn("flex flex-col gap-3", className)}>
      <div className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted sm:aspect-video">
        <iframe
          title="Mapa com o endereço da loja"
          src={linkMapaEmbed(endereco)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="size-full border-0"
        />
      </div>
      <a
        href={linkMapa(endereco)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto sm:self-start")}
      >
        <MapPinIcon />
        Abrir no Google Maps
      </a>
    </div>
  )
}

export function SiteFooter() {
  const settings = useLoja((s) => s.settings)
  const cidades = settings.cidadesAtendidas.map((c) => c.nome)

  return (
    <footer data-slot="site-footer" className="mt-16 border-t border-border bg-muted/60 pb-28 md:pb-16">
      <div className="container-loja grid gap-10 pt-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[1fr_1fr_1.2fr]">
        <section aria-labelledby="rodape-contato" className="flex flex-col gap-4">
          <Logo className="self-start" />
          <h2 id="rodape-contato" className="sr-only">
            Fale com a gente
          </h2>
          <p className="text-foreground-subtle">
            Papéis de parede escolhidos com cuidado, sob medida para a sua parede.
          </p>
          <div className="flex flex-col gap-3">
            <WhatsappLink className="w-full flex-wrap justify-start gap-x-2 text-left">
              WhatsApp <span className="whitespace-nowrap">{formatarWhatsapp(settings.whatsapp)}</span>
            </WhatsappLink>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start [overflow-wrap:anywhere]")}
            >
              <InstagramIcon className="size-6" />
              {arrobaInstagram(settings.instagram)}
            </a>
          </div>
        </section>

        <section aria-labelledby="rodape-entrega" className="flex flex-col gap-4">
          <h2 id="rodape-entrega" className="text-xl font-semibold">
            Entrega e aplicação
          </h2>
          <p>
            Enviamos para todo o Brasil. Aplicamos em {cidades[0] ?? "Uberlândia"} e regiões próximas
            {cidades.length > 1 && <>, como {cidades.slice(1).join(" e ")}</>}.
          </p>
          <TaxasDeslocamento />
          <nav aria-label="Rodapé">
            <ul className="flex flex-col">
              {LINKS_MENU.slice(1).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-12 items-center underline-offset-4 hover:underline">
                    {l.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section aria-labelledby="rodape-loja" className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
          <h2 id="rodape-loja" className="text-xl font-semibold">
            Nossa loja
          </h2>
          <p className="flex gap-2">
            <MapPinIcon className="mt-1 size-5 shrink-0" aria-hidden />
            <span>{settings.endereco}</span>
          </p>
          <p className="flex gap-2 font-semibold">
            <ClockIcon className="mt-1 size-5 shrink-0" aria-hidden />
            <span>{settings.textoAtendimento}</span>
          </p>
          <WhatsappLink variant="outline" mensagem={MENSAGEM_AGENDAR_WHATSAPP} className="w-full sm:w-auto sm:self-start">
            Agendar pelo WhatsApp
          </WhatsappLink>
          <MapaLoja />
        </section>
      </div>

      <div className="container-loja mt-10 flex flex-col gap-2 border-t border-border pt-6 text-sm text-foreground-subtle sm:flex-row sm:justify-between">
        <p>© Rodovalho Papéis de Parede — Uberlândia, MG</p>
        <Link href="/admin" className="inline-flex min-h-12 items-center underline underline-offset-4 sm:min-h-0">
          Área administrativa
        </Link>
      </div>
    </footer>
  )
}
