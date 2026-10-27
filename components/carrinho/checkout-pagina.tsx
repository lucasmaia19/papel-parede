"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useRef, useState } from "react"
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, LockIcon } from "lucide-react"
import { EntregaCarrinho } from "@/components/carrinho/entrega-carrinho"
import { ItemCarrinho } from "@/components/carrinho/item-carrinho"
import { ResumoPrecoLista } from "@/components/entrega/resumo-preco"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatarMoeda, formatarNumero } from "@/lib/pricing"
import { useFinalizarPedido } from "@/lib/use-finalizar-pedido"
import { cn } from "@/lib/utils"
import type { Cliente, Endereco, FormaPagamento } from "@/types"

const PASSOS = ["Seus dados", "Endereço", "Pagamento"] as const

function Etapas({ atual }: { atual: number }) {
  return (
    <nav aria-label="Etapas da compra">
      <p className="mb-3 font-medium md:hidden">
        Passo {atual + 1} de {PASSOS.length}: {PASSOS[atual]}
      </p>
      <ol className="grid grid-cols-3 gap-2">
        {PASSOS.map((nome, i) => {
          const feito = i < atual
          const agora = i === atual
          return (
            <li key={nome} aria-current={agora ? "step" : undefined} className="flex flex-col gap-2">
              <span className={cn("h-1.5 rounded-full", feito || agora ? "bg-primary" : "bg-border")} />
              <span
                className={cn(
                  "hidden items-center gap-2 md:flex",
                  agora ? "font-medium text-foreground" : feito ? "text-foreground" : "text-foreground-subtle",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 text-sm font-medium",
                    feito ? "border-primary bg-primary text-primary-foreground" : agora ? "border-primary text-primary" : "border-border",
                  )}
                >
                  {feito ? <CheckIcon className="size-4" /> : i + 1}
                </span>
                {nome}
                {agora && <span className="sr-only">(você está aqui)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface CampoProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  rotulo: string
  valor: string
  onChange: (v: string) => void
  erro?: string | null
  opcional?: boolean
}

function Campo({ rotulo, valor, onChange, erro, opcional, className, ...props }: CampoProps) {
  const id = useId()
  // O erro some assim que a pessoa corrige o campo (volta a valer na próxima validação)
  const [valorDoErro, setValorDoErro] = useState(valor)
  const [erroAnterior, setErroAnterior] = useState(erro)
  if (erro !== erroAnterior) {
    setErroAnterior(erro)
    setValorDoErro(valor)
  }
  const erroVisivel = erro && valor === valorDoErro ? erro : null
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium">
        {rotulo} {opcional && <span className="font-normal text-foreground-subtle">(opcional)</span>}
      </label>
      <Input
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erroVisivel ? true : undefined}
        aria-describedby={erroVisivel ? `${id}-erro` : undefined}
        {...props}
      />
      {erroVisivel && (
        <p id={`${id}-erro`} className="font-medium text-destructive">
          {erroVisivel}
        </p>
      )}
    </div>
  )
}

function formatarTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`
}

type Erros = Partial<Record<string, string>>

export function CheckoutPagina() {
  const router = useRouter()
  const { hidratado, itens, resumo, local, cep, resultadoCep, settings, finalizar } = useFinalizarPedido()
  const [passo, setPasso] = useState(0)
  const [cliente, setCliente] = useState<Cliente>({ nome: "", telefone: "", email: "" })
  const [endereco, setEndereco] = useState<Omit<Endereco, "cep" | "cidade" | "uf"> & { cidade: string; uf: string }>({
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  })
  const [pagamento, setPagamento] = useState<FormaPagamento>("pix")
  const [erros, setErros] = useState<Erros>({})
  const topo = useRef<HTMLHeadingElement>(null)

  // Ao trocar o CEP, preenche cidade e UF quando conhecidas
  const [cepAnterior, setCepAnterior] = useState(cep)
  if (cep !== cepAnterior) {
    setCepAnterior(cep)
    setEndereco((e) => ({
      ...e,
      uf: resultadoCep?.uf ?? e.uf,
      cidade: resultadoCep?.tipo === "atendida" ? resultadoCep.cidade.nome : e.cidade,
    }))
  }
  const ufAtual = endereco.uf || resultadoCep?.uf || ""
  const cidadeAtual = endereco.cidade || (resultadoCep?.tipo === "atendida" ? resultadoCep.cidade.nome : "")

  if (!hidratado) return <div className="container-loja min-h-[50vh] py-10" aria-busy="true" />

  if (itens.length === 0) {
    return (
      <div className="container-loja flex flex-col items-start gap-5 py-12">
        <h1 className="text-3xl">Seu carrinho está vazio</h1>
        <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
          Ver papéis de parede
        </Link>
      </div>
    )
  }

  function irPara(n: number) {
    setPasso(n)
    setErros({})
    requestAnimationFrame(() => {
      topo.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      topo.current?.focus({ preventScroll: true })
    })
  }

  function validarDados(): boolean {
    const e: Erros = {}
    if (cliente.nome.trim().length < 3) e.nome = "Digite seu nome completo."
    if (cliente.telefone.replace(/\D/g, "").length < 10) e.telefone = "Digite o telefone com DDD. Exemplo: (34) 9 9999-9999"
    if (cliente.email && !/^\S+@\S+\.\S+$/.test(cliente.email)) e.email = "Confira o e-mail. Exemplo: maria@gmail.com"
    setErros(e)
    return Object.keys(e).length === 0
  }

  function validarEndereco(): boolean {
    const e: Erros = {}
    if (!resultadoCep) e.cep = "Digite o CEP e toque em Calcular."
    if (!endereco.rua.trim()) e.rua = "Digite a rua."
    if (!endereco.numero.trim()) e.numero = "Digite o número (ou S/N)."
    if (!endereco.bairro.trim()) e.bairro = "Digite o bairro."
    if (!cidadeAtual.trim()) e.cidade = "Digite a cidade."
    setErros(e)
    return Object.keys(e).length === 0
  }

  function confirmar() {
    const pedido = finalizar({
      cliente: { ...cliente, nome: cliente.nome.trim() },
      endereco: { ...endereco, cep, cidade: cidadeAtual, uf: ufAtual },
      formaPagamento: pagamento,
      canal: "site",
    })
    router.push(`/pedido-confirmado?id=${pedido.id}`)
  }

  const naRegiao = local?.tipo === "atendida"
  const totalFinal = pagamento === "pix" ? resumo.totalPix : resumo.total

  const opcoesPagamento: { id: FormaPagamento; titulo: string; detalhe: string }[] = [
    {
      id: "pix",
      titulo: "Pix",
      detalhe: `${formatarMoeda(resumo.totalPix)} — ${formatarNumero(settings.descontoPix)}% de desconto`,
    },
    { id: "cartao", titulo: "Cartão de crédito", detalhe: `${formatarMoeda(resumo.total)} em até 3x sem juros` },
    { id: "boleto", titulo: "Boleto", detalhe: `${formatarMoeda(resumo.total)} — vence em 3 dias úteis` },
  ]

  const resumoLateral = (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-3">
        {itens.map((item) => (
          <li key={item.id}>
            <ItemCarrinho item={item} naRegiao={naRegiao} somenteLeitura />
          </li>
        ))}
      </ul>
      <ResumoPrecoLista resumo={resumo} local={local} descontoPixPct={settings.descontoPix} rotuloPapel="Papéis de parede" />
    </div>
  )

  return (
    <div className="container-loja flex flex-col gap-6 py-8 md:py-12">
      <Link href="/carrinho" className="inline-flex min-h-12 items-center gap-2 self-start font-medium underline-offset-4 hover:underline">
        <ArrowLeftIcon className="size-5" aria-hidden />
        Voltar ao carrinho
      </Link>
      <h1 ref={topo} tabIndex={-1} className="scroll-mt-24 text-3xl outline-none md:text-4xl">
        Finalizar compra
      </h1>
      <Etapas atual={passo} />

      <details className="group rounded-md border border-border bg-surface-raised lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 font-medium [&::-webkit-details-marker]:hidden">
          <span>Resumo do pedido</span>
          <span className="flex items-center gap-2 tabular-nums">
            {formatarMoeda(resumo.total)}
            <ChevronDownIcon className="size-5 transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>
        <div className="border-t border-border p-4">{resumoLateral}</div>
      </details>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-6">
          {passo === 0 && (
            <section aria-label="Seus dados" className="flex flex-col gap-5">
              <h2 className="text-2xl">Seus dados</h2>
              <Campo
                rotulo="Nome completo"
                autoComplete="name"
                valor={cliente.nome}
                onChange={(nome) => setCliente({ ...cliente, nome })}
                erro={erros.nome}
              />
              <Campo
                rotulo="Telefone / WhatsApp"
                autoComplete="tel-national"
                inputMode="tel"
                placeholder="(34) 9 9999-9999"
                valor={cliente.telefone}
                onChange={(t) => setCliente({ ...cliente, telefone: formatarTelefone(t) })}
                erro={erros.telefone}
              />
              <Campo
                rotulo="E-mail"
                opcional
                type="email"
                autoComplete="email"
                inputMode="email"
                valor={cliente.email}
                onChange={(email) => setCliente({ ...cliente, email })}
                erro={erros.email}
              />
              <Button size="lg" onClick={() => validarDados() && irPara(1)}>
                Continuar
              </Button>
            </section>
          )}

          {passo === 1 && (
            <section aria-label="Endereço" className="flex flex-col gap-5">
              <h2 className="text-2xl">Endereço</h2>
              <EntregaCarrinho itens={itens} resultadoCep={resultadoCep} resumo={resumo} />
              {erros.cep && !resultadoCep && (
                <p role="alert" className="font-medium text-destructive">
                  {erros.cep}
                </p>
              )}
              {resultadoCep && (
                <div className="flex flex-col gap-4">
                  <Campo rotulo="Rua" autoComplete="address-line1" valor={endereco.rua} onChange={(rua) => setEndereco({ ...endereco, rua })} erro={erros.rua} />
                  <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
                    <Campo rotulo="Número" inputMode="numeric" valor={endereco.numero} onChange={(numero) => setEndereco({ ...endereco, numero })} erro={erros.numero} />
                    <Campo
                      rotulo="Complemento"
                      opcional
                      autoComplete="address-line2"
                      valor={endereco.complemento ?? ""}
                      onChange={(complemento) => setEndereco({ ...endereco, complemento })}
                    />
                  </div>
                  <Campo rotulo="Bairro" valor={endereco.bairro} onChange={(bairro) => setEndereco({ ...endereco, bairro })} erro={erros.bairro} />
                  <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-3">
                    <Campo rotulo="Cidade" autoComplete="address-level2" valor={cidadeAtual} onChange={(cidade) => setEndereco({ ...endereco, cidade })} erro={erros.cidade} />
                    <Campo rotulo="UF" valor={ufAtual} readOnly aria-readonly className="[&_input]:bg-muted" onChange={() => {}} />
                  </div>
                </div>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button variant="outline" size="lg" onClick={() => irPara(0)}>
                  Voltar
                </Button>
                <Button size="lg" className="flex-1" onClick={() => validarEndereco() && irPara(2)}>
                  Continuar
                </Button>
              </div>
            </section>
          )}

          {passo === 2 && (
            <section aria-label="Pagamento" className="flex flex-col gap-5">
              <h2 className="text-2xl">Pagamento</h2>
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Forma de pagamento</legend>
                {opcoesPagamento.map((o) => (
                  <label
                    key={o.id}
                    className={cn(
                      "flex min-h-16 cursor-pointer items-center gap-4 rounded-md border-2 p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                      pagamento === o.id ? "border-primary bg-primary-soft/50" : "border-input bg-surface-raised hover:bg-accent",
                    )}
                  >
                    <input
                      type="radio"
                      name="pagamento"
                      value={o.id}
                      checked={pagamento === o.id}
                      onChange={() => setPagamento(o.id)}
                      className="size-6 shrink-0 accent-primary"
                    />
                    <span className="flex flex-col">
                      <span className="text-lg font-medium">{o.titulo}</span>
                      <span className="text-foreground-subtle">{o.detalhe}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="flex gap-2 rounded-md border border-warning-border bg-warning-bg p-4">
                <LockIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
                Nesta versão o pagamento é simulado: nenhuma cobrança é feita. A loja confirma o pedido com você.
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button variant="outline" size="lg" onClick={() => irPara(1)}>
                  Voltar
                </Button>
                <Button size="lg" className="flex-1" onClick={confirmar}>
                  Confirmar pedido — {formatarMoeda(totalFinal)}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside aria-label="Resumo do pedido" className="hidden lg:sticky lg:top-24 lg:block">
          <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-5">
            <h2 className="text-xl">Resumo do pedido</h2>
            {resumoLateral}
          </div>
        </aside>
      </div>
    </div>
  )
}
