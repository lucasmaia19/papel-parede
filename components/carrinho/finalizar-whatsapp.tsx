"use client"

import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { WhatsappIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { linkWhatsapp } from "@/lib/contato"
import { mensagemOrcamento } from "@/lib/pedido"
import { useFinalizarPedido } from "@/lib/use-finalizar-pedido"
import { cn } from "@/lib/utils"

/** "Finalizar pelo WhatsApp": pede o nome, salva o pedido (canal whatsapp) e abre a conversa com o orçamento. */
export function FinalizarWhatsapp({ className }: { className?: string }) {
  const router = useRouter()
  const id = useId()
  const { itens, resumo, local, cep, resultadoCep, settings, finalizar } = useFinalizarPedido()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState("")
  const [erro, setErro] = useState(false)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (nome.trim().length < 2) {
      setErro(true)
      return
    }
    const pedido = finalizar({
      cliente: { nome: nome.trim(), telefone: "", email: "" },
      endereco: {
        cep,
        rua: "",
        numero: "",
        bairro: "",
        cidade: resultadoCep?.tipo === "atendida" ? resultadoCep.cidade.nome : "",
        uf: resultadoCep?.uf ?? "",
      },
      formaPagamento: "whatsapp",
      canal: "whatsapp",
    })
    const texto = mensagemOrcamento({
      itens,
      resumo,
      local,
      cep,
      uf: resultadoCep?.uf,
      descontoPixPct: settings.descontoPix,
      nome: nome.trim(),
      numeroPedido: pedido.numero,
    })
    window.open(linkWhatsapp(settings.whatsapp, texto), "_blank", "noopener,noreferrer")
    router.push(`/pedido-confirmado?id=${pedido.id}`)
  }

  return (
    <>
      <Button variant="whatsapp" className={cn("min-h-14 w-full", className)} onClick={() => setAberto(true)}>
        <WhatsappIcon className="size-6" />
        Finalizar pelo WhatsApp
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar pelo WhatsApp</DialogTitle>
            <DialogDescription>
              Vamos abrir o WhatsApp da loja com o seu orçamento completo. É só enviar a mensagem.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={id} className="font-medium">
                Seu nome
              </label>
              <Input
                id={id}
                autoComplete="name"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setErro(false)
                }}
                aria-invalid={erro ? true : undefined}
                aria-describedby={erro ? `${id}-erro` : undefined}
              />
              {erro && (
                <p id={`${id}-erro`} role="alert" className="font-medium text-destructive">
                  Digite seu nome para a loja saber com quem está falando.
                </p>
              )}
            </div>
            <Button type="submit" variant="whatsapp" size="lg">
              <WhatsappIcon className="size-6" />
              Abrir WhatsApp com o orçamento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
