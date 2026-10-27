"use client"

import type { ComponentProps } from "react"
import type { VariantProps } from "class-variance-authority"
import { WhatsappIcon } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { linkWhatsapp } from "@/lib/contato"
import { useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"

interface WhatsappLinkProps extends Omit<ComponentProps<"a">, "href">, VariantProps<typeof buttonVariants> {
  /** Mensagem pré-preenchida */
  mensagem?: string
}

/** Botão-link para o WhatsApp da loja (abre em nova aba). Variante padrão: verde do WhatsApp. */
export function WhatsappLink({
  mensagem,
  variant = "whatsapp",
  size,
  className,
  children,
  ...props
}: WhatsappLinkProps) {
  const numero = useLoja((s) => s.settings.whatsapp)
  return (
    <a
      data-slot="whatsapp-link"
      href={linkWhatsapp(numero, mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      <WhatsappIcon className={cn("size-6", variant !== "whatsapp" && "text-whatsapp")} />
      {children}
    </a>
  )
}
