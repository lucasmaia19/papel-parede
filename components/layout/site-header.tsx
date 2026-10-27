"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { MenuIcon, ShoppingBagIcon } from "lucide-react"
import { InstagramIcon } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { WhatsappLink } from "@/components/whatsapp-link"
import { arrobaInstagram, formatarWhatsapp } from "@/lib/contato"
import { useHidratado, useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"

export const LINKS_MENU = [
  { href: "/", rotulo: "Início" },
  { href: "/produtos", rotulo: "Papéis de parede" },
  { href: "/pronta-entrega", rotulo: "Pronta entrega" },
  { href: "/trabalhos", rotulo: "Trabalhos realizados" },
  { href: "/contato", rotulo: "Contato" },
] as const

function linkAtivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      data-slot="logo"
      className={cn("flex min-h-12 flex-col justify-center leading-none outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
    >
      <span className="font-heading text-[1.85rem] font-light tracking-wide text-foreground-heading md:text-[2.1rem]">Rodovalho</span>
      <span className="mt-0.5 text-[0.72rem] font-normal tracking-[0.28em] text-foreground-subtle uppercase">
        Papéis de Parede
      </span>
    </Link>
  )
}

function useQuantidadeCarrinho() {
  const hidratado = useHidratado()
  const quantidade = useLoja((s) => s.carrinho.length)
  return hidratado ? quantidade : 0
}

export function SiteHeader() {
  const pathname = usePathname()
  const quantidade = useQuantidadeCarrinho()
  const [menuAberto, setMenuAberto] = useState(false)
  const settings = useLoja((s) => s.settings)

  return (
    <header data-slot="site-header" className="sticky top-0 z-40 border-b border-border bg-background/97">
      <div className="container-loja flex h-[4.5rem] items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {LINKS_MENU.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={linkAtivo(pathname, link.href) ? "page" : undefined}
                  className="relative inline-flex min-h-12 items-center px-3 text-base font-medium text-foreground-subtle transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-2 aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary"
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/carrinho"
            aria-label={`Carrinho, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "relative flex-col gap-0.5 px-2.5 text-xs font-medium lg:flex-row lg:gap-2 lg:text-base",
            )}
          >
            <span className="relative">
              <ShoppingBagIcon className="size-6" aria-hidden />
              {quantidade > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.75rem] leading-5 font-medium text-primary-foreground">
                  {quantidade}
                </span>
              )}
            </span>
            Carrinho
          </Link>

          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "flex-col gap-0.5 px-2.5 text-xs font-medium lg:hidden",
              )}
            >
              <MenuIcon className="size-6" aria-hidden />
              Menu
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm data-[side=right]:w-full">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Menu do celular" className="p-2">
                <ul className="flex flex-col">
                  {LINKS_MENU.map((link) => (
                    <li key={link.href} className="border-b border-border last:border-b-0">
                      <Link
                        href={link.href}
                        onClick={() => setMenuAberto(false)}
                        aria-current={linkAtivo(pathname, link.href) ? "page" : undefined}
                        className="flex min-h-14 items-center px-3 text-lg font-medium text-foreground aria-[current=page]:font-medium aria-[current=page]:text-primary"
                      >
                        {link.rotulo}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-border">
                    <Link
                      href="/carrinho"
                      onClick={() => setMenuAberto(false)}
                      className="flex min-h-14 items-center px-3 text-lg font-medium"
                    >
                      Carrinho {quantidade > 0 && `(${quantidade})`}
                    </Link>
                  </li>
                </ul>
              </nav>
              <SheetFooter>
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
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
