"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ExternalLinkIcon, MenuIcon, TriangleAlertIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { EVENTO_ARMAZENAMENTO_CHEIO } from "@/lib/store"
import { cn } from "@/lib/utils"

export const LINKS_ADMIN = [
  { href: "/admin", rotulo: "Painel" },
  { href: "/admin/produtos", rotulo: "Papéis de parede" },
  { href: "/admin/ambientes", rotulo: "Ambientes" },
  { href: "/admin/trabalhos", rotulo: "Trabalhos realizados" },
  { href: "/admin/configuracoes", rotulo: "Configurações" },
  { href: "/admin/pedidos", rotulo: "Pedidos" },
] as const

function ativo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}

interface LinksProps {
  movel?: boolean
  onNavegar?: () => void
}

function ListaLinks({ pathname, movel, onNavegar }: LinksProps & { pathname: string | null }) {
  return (
    <>
      {LINKS_ADMIN.map((l) => (
        <li key={l.href} className={movel ? "border-b border-border" : undefined}>
          <Link
            href={l.href}
            onClick={onNavegar}
            aria-current={pathname && ativo(pathname, l.href) ? "page" : undefined}
            className={
              movel
                ? "flex min-h-14 items-center px-3 text-lg aria-[current=page]:font-medium aria-[current=page]:text-primary"
                : "inline-flex min-h-12 items-center rounded-md px-3 font-medium text-foreground-subtle hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            }
          >
            {l.rotulo}
          </Link>
        </li>
      ))}
    </>
  )
}

function LinksComDestaque(props: LinksProps) {
  return <ListaLinks pathname={usePathname()} {...props} />
}

/** usePathname em rota dinâmica precisa de Suspense (Cache Components); o fallback é a lista sem destaque. */
function LinksAdmin(props: LinksProps) {
  return (
    <Suspense fallback={<ListaLinks pathname={null} {...props} />}>
      <LinksComDestaque {...props} />
    </Suspense>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false)
  const [semEspaco, setSemEspaco] = useState(false)

  useEffect(() => {
    const aviso = () => setSemEspaco(true)
    window.addEventListener(EVENTO_ARMAZENAMENTO_CHEIO, aviso)
    return () => window.removeEventListener(EVENTO_ARMAZENAMENTO_CHEIO, aviso)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <p
        role="note"
        data-slot="aviso-admin"
        className="flex items-start gap-2 border-b border-warning-border bg-warning-bg px-4 py-3 text-sm sm:items-center sm:justify-center sm:text-base"
      >
        <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 sm:mt-0" aria-hidden />
        <span>
          <strong className="font-medium">Área administrativa</strong> — no sistema final esta tela será acessível apenas pelo
          administrador, com login. Nesta versão de protótipo ela está aberta.
        </span>
      </p>

      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container-loja flex h-16 items-center justify-between gap-3">
          <Link href="/admin" className="flex min-h-12 flex-col justify-center leading-none">
            <span className="font-heading text-xl font-medium">Rodovalho</span>
            <span className="mt-0.5 text-xs font-medium tracking-[0.16em] text-foreground-subtle uppercase">Administração</span>
          </Link>
          <nav aria-label="Administração" className="hidden lg:block">
            <ul className="flex gap-1">
              <LinksAdmin />
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}>
              <ExternalLinkIcon aria-hidden />
              Ver loja
            </Link>
            <Sheet open={menu} onOpenChange={setMenu}>
              <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "lg:hidden")}>
                <MenuIcon aria-hidden />
                Menu
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm data-[side=right]:w-full">
                <SheetHeader>
                  <SheetTitle>Administração</SheetTitle>
                </SheetHeader>
                <nav aria-label="Menu da administração" className="p-2">
                  <ul>
                    <LinksAdmin movel onNavegar={() => setMenu(false)} />
                    <li>
                      <Link href="/" onClick={() => setMenu(false)} className="flex min-h-14 items-center gap-2 px-3 text-lg">
                        <ExternalLinkIcon className="size-5" aria-hidden />
                        Ver loja
                      </Link>
                    </li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {semEspaco && (
        <p role="alert" className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 font-medium text-destructive">
          O navegador ficou sem espaço para guardar as alterações. Use fotos menores ou remova fotos antigas.
        </p>
      )}

      <main id="conteudo" className="flex-1 pb-32">
        {children}
      </main>
    </div>
  )
}

export function CabecalhoAdmin({ titulo, descricao, acoes }: { titulo: string; descricao?: React.ReactNode; acoes?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl">{titulo}</h1>
        {descricao && <p className="text-foreground-subtle">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-col gap-2 sm:flex-row">{acoes}</div>}
    </div>
  )
}
