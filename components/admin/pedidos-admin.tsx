"use client"

import { useId, useState } from "react"
import { ChevronDownIcon, SparklesIcon } from "lucide-react"
import { CabecalhoAdmin } from "@/components/admin/admin-shell"
import { classeSelect } from "@/components/admin/campos"
import { OpcaoBotao } from "@/components/opcao-botao"
import { Badge } from "@/components/ui/badge"
import { WhatsappLink } from "@/components/whatsapp-link"
import { buttonVariants } from "@/components/ui/button"
import { WhatsappIcon } from "@/components/icons"
import { textoPersonalizacoes } from "@/lib/configurador"
import { linkWhatsapp } from "@/lib/contato"
import { ROTULO_PAGAMENTO, textoParedes } from "@/lib/pedido"
import { formatarM2, formatarMoeda } from "@/lib/pricing"
import { useHidratado, useLoja } from "@/lib/store"
import { STATUS_PEDIDO, type CanalPedido, type Order, type StatusPedido } from "@/types"

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })

function Linha({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-foreground-subtle">{rotulo}</dt>
      <dd className="text-right font-medium tabular-nums">{valor}</dd>
    </div>
  )
}

function CartaoPedido({ pedido }: { pedido: Order }) {
  const alterarStatus = useLoja((s) => s.alterarStatusPedido)
  const idStatus = useId()
  const telefone = pedido.cliente.telefone.replace(/\D/g, "")
  const local = [pedido.endereco.cidade, pedido.endereco.uf].filter(Boolean).join(" - ") || "Cidade não informada"

  return (
    <article data-slot="pedido-admin" className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-sans text-lg">
            Pedido nº {pedido.numero} — {pedido.cliente.nome}
          </h2>
          <p className="text-foreground-subtle">
            {data.format(new Date(pedido.data))} · {local}
            {pedido.endereco.cep && ` · CEP ${pedido.endereco.cep}`}
          </p>
        </div>
        <Badge variant={pedido.canal === "whatsapp" ? "soft" : "secondary"}>{pedido.canal === "whatsapp" ? "WhatsApp" : "Site"}</Badge>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-xl font-medium tabular-nums">{formatarMoeda(pedido.total)}</p>
        <div className="flex min-w-56 flex-col gap-1.5">
          <label htmlFor={idStatus} className="font-medium">
            Status
          </label>
          <select
            id={idStatus}
            value={pedido.status}
            onChange={(e) => alterarStatus(pedido.id, e.target.value as StatusPedido)}
            className={classeSelect}
          >
            {STATUS_PEDIDO.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <details className="group rounded-md border border-border">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-3 font-medium [&::-webkit-details-marker]:hidden">
          Ver detalhes ({pedido.itens.length} {pedido.itens.length === 1 ? "item" : "itens"})
          <ChevronDownIcon className="size-5 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="flex flex-col gap-4 border-t border-border p-3">
          <ul className="flex flex-col gap-3">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0">
                <p className="font-medium">{item.produtoNome}</p>
                <p>
                  Cor: {item.cor.nome}
                  {item.personalizacoes.length > 0 && ` · ${textoPersonalizacoes(item.personalizacoes)}`}
                </p>
                <p>
                  {formatarM2(item.m2)} <span className="text-foreground-subtle">({textoParedes(item)})</span>
                </p>
                <p>
                  Serviços:{" "}
                  {[item.servicos.aplicacao && "aplicação", item.servicos.visita && "visita técnica"].filter(Boolean).join(", ") || "nenhum"}
                </p>
                {item.simulacao && (
                  <div className="mt-1 flex gap-3 rounded-md bg-muted/60 p-2">
                    {item.simulacao.imagem && (
                      // eslint-disable-next-line @next/next/no-img-element -- base64
                      <img src={item.simulacao.imagem} alt="Simulação com IA" className="size-20 rounded-sm object-cover" />
                    )}
                    <p className="flex flex-col">
                      <span className="flex items-center gap-1 font-medium">
                        <SparklesIcon className="size-4" aria-hidden />
                        Observação (IA)
                      </span>
                      {item.simulacao.observacao || "—"}
                    </p>
                  </div>
                )}
                <p className="font-medium">Subtotal: {formatarMoeda(item.subtotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-1.5">
            {pedido.visita > 0 && <Linha rotulo="Visita técnica" valor={formatarMoeda(pedido.visita)} />}
            {pedido.naRegiao && <Linha rotulo="Deslocamento" valor={pedido.deslocamento > 0 ? formatarMoeda(pedido.deslocamento) : "Grátis"} />}
            {!pedido.naRegiao && pedido.endereco.cep && <Linha rotulo="Frete" valor={pedido.frete > 0 ? formatarMoeda(pedido.frete) : "Grátis"} />}
            {pedido.descontoPix > 0 && <Linha rotulo="Desconto Pix" valor={`− ${formatarMoeda(pedido.descontoPix)}`} />}
            <Linha rotulo="Pagamento" valor={ROTULO_PAGAMENTO[pedido.formaPagamento]} />
            <Linha rotulo="Modalidade" valor={pedido.modalidade === "aplicacao" ? "Aplicação na região" : "Entrega"} />
          </dl>
          {(pedido.cliente.telefone || pedido.cliente.email) && (
            <p>
              Contato: {pedido.cliente.telefone}
              {pedido.cliente.email && ` · ${pedido.cliente.email}`}
            </p>
          )}
          {pedido.endereco.rua && (
            <p>
              Endereço: {pedido.endereco.rua}, {pedido.endereco.numero}
              {pedido.endereco.complemento && ` — ${pedido.endereco.complemento}`}, {pedido.endereco.bairro}
            </p>
          )}
          <p className="text-foreground-subtle">Prazo informado ao cliente: {pedido.prazoTexto}</p>
        </div>
      </details>

      {telefone ? (
        <a
          href={linkWhatsapp(`55${telefone}`, `Olá, ${pedido.cliente.nome.split(" ")[0]}! Aqui é da Rodovalho Papéis de Parede, sobre o seu pedido nº ${pedido.numero}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "whatsapp" })}
        >
          <WhatsappIcon className="size-6" />
          Chamar no WhatsApp
        </a>
      ) : (
        <p className="text-sm text-foreground-subtle">
          O cliente mandou o pedido pelo WhatsApp: a conversa está no WhatsApp da loja.
        </p>
      )}
    </article>
  )
}

export function PedidosAdmin() {
  const hidratado = useHidratado()
  const pedidos = useLoja((s) => s.pedidos)
  const [status, setStatus] = useState<StatusPedido | null>(null)
  const [canal, setCanal] = useState<CanalPedido | null>(null)

  const lista = pedidos.filter((p) => (!status || p.status === status) && (!canal || p.canal === canal))

  return (
    <div className="container-loja flex flex-col gap-6 py-8">
      <CabecalhoAdmin titulo="Pedidos" descricao="Pedidos feitos no site e enviados pelo WhatsApp." />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Status</legend>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <OpcaoBotao ativo={status === null} onClick={() => setStatus(null)}>
            Todos
          </OpcaoBotao>
          {STATUS_PEDIDO.map((s) => (
            <OpcaoBotao key={s} ativo={status === s} onClick={() => setStatus(s)}>
              {s}
            </OpcaoBotao>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Canal</legend>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <OpcaoBotao ativo={canal === null} onClick={() => setCanal(null)}>
            Todos
          </OpcaoBotao>
          <OpcaoBotao ativo={canal === "site"} onClick={() => setCanal("site")}>
            Site
          </OpcaoBotao>
          <OpcaoBotao ativo={canal === "whatsapp"} onClick={() => setCanal("whatsapp")}>
            WhatsApp
          </OpcaoBotao>
        </div>
      </fieldset>

      {hidratado && (
        <p aria-live="polite" className="font-medium">
          {lista.length} {lista.length === 1 ? "pedido" : "pedidos"}
        </p>
      )}

      {hidratado && pedidos.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-5">
          <p className="text-lg">Ainda não há pedidos.</p>
          <WhatsappLink variant="outline">Abrir o WhatsApp da loja</WhatsappLink>
        </div>
      )}

      <ul className="grid gap-4 lg:grid-cols-2">
        {lista.map((p) => (
          <li key={p.id}>
            <CartaoPedido pedido={p} />
          </li>
        ))}
      </ul>
    </div>
  )
}
