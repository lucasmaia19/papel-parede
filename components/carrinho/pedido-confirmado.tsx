"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { CalendarClockIcon, CircleCheckBigIcon } from "lucide-react"
import { ItemCarrinho } from "@/components/carrinho/item-carrinho"
import { buttonVariants } from "@/components/ui/button"
import { WhatsappLink } from "@/components/whatsapp-link"
import { ROTULO_PAGAMENTO, resumoDoPedido } from "@/lib/pedido"
import { formatarMoeda } from "@/lib/pricing"
import { useHidratado, useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"

function Linha({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{rotulo}</dt>
      <dd className="text-right font-medium tabular-nums">{valor}</dd>
    </div>
  )
}

export function PedidoConfirmado() {
  const id = useSearchParams().get("id")
  const hidratado = useHidratado()
  const pedido = useLoja((s) => s.pedidos.find((p) => p.id === id))
  const concluirPedido = useLoja((s) => s.concluirPedido)

  // O carrinho deste pedido é esvaziado aqui (só uma vez, só para o pedido recém-criado)
  useEffect(() => {
    if (pedido) concluirPedido(pedido.id)
  }, [pedido, concluirPedido])

  if (!hidratado) return <div className="container-loja min-h-[50vh] py-10" aria-busy="true" />

  if (!pedido) {
    return (
      <div className="container-loja flex flex-col items-start gap-5 py-12">
        <h1 className="text-3xl">Pedido não encontrado</h1>
        <p>Se você acabou de fazer um pedido, fale com a gente pelo WhatsApp.</p>
        <WhatsappLink>Falar no WhatsApp</WhatsappLink>
      </div>
    )
  }

  const whatsapp = pedido.canal === "whatsapp"

  return (
    <div className="container-loja flex max-w-3xl flex-col gap-8 py-10 md:py-14">
      <div className="flex flex-col gap-3">
        <CircleCheckBigIcon className="size-12 text-primary" aria-hidden />
        <h1 className="text-3xl md:text-4xl">
          {whatsapp ? "Orçamento enviado para o WhatsApp" : "Pedido confirmado!"}
        </h1>
        <p className="text-lg">
          Pedido nº <strong className="font-medium">{pedido.numero}</strong> — obrigado, {pedido.cliente.nome.split(" ")[0]}.
        </p>
        <p className="text-foreground-subtle">
          {whatsapp
            ? "Se o WhatsApp não abriu, toque no botão abaixo. A loja responde e combina o pagamento com você."
            : "Nossa equipe confere tudo e entra em contato pelo telefone informado antes de produzir."}
        </p>
      </div>

      <div className="flex gap-3 rounded-md border border-border bg-surface-raised p-4">
        <CalendarClockIcon className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">Prazo estimado</p>
          <p>{pedido.prazoTexto}</p>
        </div>
      </div>

      <WhatsappLink mensagem={resumoDoPedido(pedido)} className="min-h-14 w-full sm:w-auto sm:self-start">
        {whatsapp ? "Abrir WhatsApp de novo" : "Falar com a loja no WhatsApp"}
      </WhatsappLink>

      <section aria-labelledby="titulo-itens-pedido" className="flex flex-col gap-4">
        <h2 id="titulo-itens-pedido" className="text-xl">
          Resumo
        </h2>
        <ul className="flex flex-col gap-3">
          {pedido.itens.map((item) => (
            <li key={item.id}>
              <ItemCarrinho item={item} naRegiao={pedido.naRegiao} somenteLeitura />
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 rounded-md border border-border bg-surface-raised p-4">
          {pedido.visita > 0 && <Linha rotulo="Visita de medição" valor={formatarMoeda(pedido.visita)} />}
          {pedido.deslocamento > 0 && <Linha rotulo="Deslocamento" valor={formatarMoeda(pedido.deslocamento)} />}
          {!pedido.naRegiao && pedido.endereco.cep && <Linha rotulo="Frete" valor={pedido.frete > 0 ? formatarMoeda(pedido.frete) : "Grátis"} />}
          {pedido.descontoPix > 0 && <Linha rotulo="Desconto Pix" valor={`− ${formatarMoeda(pedido.descontoPix)}`} />}
          <Linha rotulo="Pagamento" valor={ROTULO_PAGAMENTO[pedido.formaPagamento]} />
          <div className="mt-1 flex justify-between gap-4 border-t border-border pt-3 text-lg">
            <dt className="font-medium">Total</dt>
            <dd className="font-medium text-primary tabular-nums">{formatarMoeda(pedido.total)}</dd>
          </div>
        </dl>
        {pedido.endereco.rua && (
          <p className="text-foreground-subtle">
            Endereço: {pedido.endereco.rua}, {pedido.endereco.numero}
            {pedido.endereco.complemento ? ` — ${pedido.endereco.complemento}` : ""}, {pedido.endereco.bairro},{" "}
            {pedido.endereco.cidade} - {pedido.endereco.uf}, {pedido.endereco.cep}
          </p>
        )}
      </section>

      <Link href="/produtos" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto sm:self-start")}>
        Voltar para a loja
      </Link>
    </div>
  )
}
