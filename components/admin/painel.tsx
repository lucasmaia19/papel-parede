"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react"
import { CabecalhoAdmin } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useHidratado, useLoja } from "@/lib/store"

function Numero({ rotulo, valor, href }: { rotulo: string; valor: number | string; href: string }) {
  return (
    <Link
      href={href}
      data-slot="numero-painel"
      className="flex flex-col gap-1 rounded-md border border-border bg-surface-raised p-4 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="text-sm font-medium text-foreground-subtle">{rotulo}</span>
      <span className="text-4xl font-light text-foreground-heading tabular-nums">{valor}</span>
    </Link>
  )
}

const ATALHOS = [
  { href: "/admin/produtos", titulo: "Papéis de parede", texto: "Cadastrar, editar fotos, cores, preços e régua." },
  { href: "/admin/ambientes", titulo: "Ambientes", texto: "O filtro “Para qual ambiente?”: cômodos, perguntas e opções." },
  { href: "/admin/trabalhos", titulo: "Trabalhos realizados", texto: "Fotos de antes e depois que aparecem na loja." },
  { href: "/admin/configuracoes", titulo: "Configurações", texto: "Preços de serviços, frete, cidades, contatos." },
  { href: "/admin/pedidos", titulo: "Pedidos", texto: "Pedidos do site e do WhatsApp, com status." },
] as const

export function Painel() {
  const hidratado = useHidratado()
  const produtos = useLoja((s) => s.produtos)
  const pedidos = useLoja((s) => s.pedidos)
  const restaurar = useLoja((s) => s.restaurarDadosDeExemplo)
  const [confirmar, setConfirmar] = useState(false)
  const [restaurado, setRestaurado] = useState(false)

  const ativos = produtos.filter((p) => p.ativo).length
  const novos = pedidos.filter((p) => p.status === "Novo").length
  const viaWhatsapp = pedidos.filter((p) => p.canal === "whatsapp").length
  const mostrar = (n: number) => (hidratado ? n : "–")

  return (
    <div className="container-loja flex flex-col gap-8 py-8">
      <CabecalhoAdmin titulo="Painel" descricao="Resumo da loja e atalhos." />

      <section aria-label="Números" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Numero rotulo="Papéis à venda" valor={mostrar(ativos)} href="/admin/produtos" />
        <Numero rotulo="Papéis cadastrados" valor={mostrar(produtos.length)} href="/admin/produtos" />
        <Numero rotulo="Pedidos novos" valor={mostrar(novos)} href="/admin/pedidos" />
        <Numero rotulo="Pedidos via WhatsApp" valor={mostrar(viaWhatsapp)} href="/admin/pedidos" />
      </section>

      <section aria-label="Atalhos" className="grid gap-3 md:grid-cols-2">
        {ATALHOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center justify-between gap-4 rounded-md border border-border bg-surface-raised p-5 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex flex-col gap-1">
              <span className="text-xl font-medium">{a.titulo}</span>
              <span className="text-foreground-subtle">{a.texto}</span>
            </span>
            <ArrowRightIcon className="size-6 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        ))}
      </section>

      <section aria-label="Dados de exemplo" className="flex flex-col items-start gap-3 border-t border-border pt-6">
        <h2 className="text-xl">Dados de exemplo</h2>
        <p className="max-w-prose text-foreground-subtle">
          Volta os papéis, ambientes, trabalhos e configurações para os dados de exemplo e apaga os pedidos. Útil para testar o
          protótipo do zero.
        </p>
        <Button variant="outline" onClick={() => setConfirmar(true)}>
          <RotateCcwIcon aria-hidden />
          Restaurar dados de exemplo
        </Button>
        {restaurado && (
          <p role="status" className="font-medium text-success">
            Dados de exemplo restaurados.
          </p>
        )}
      </section>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar dados de exemplo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tudo o que foi cadastrado ou alterado no admin será perdido, e os pedidos serão apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                restaurar()
                setConfirmar(false)
                setRestaurado(true)
              }}
            >
              Sim, restaurar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
