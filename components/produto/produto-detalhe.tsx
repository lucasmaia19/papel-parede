"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeftIcon, ChevronUpIcon, ClockIcon, PackageCheckIcon, ShoppingBagIcon } from "lucide-react"
import { CampoCep, useResultadoCep } from "@/components/entrega/campo-cep"
import { InfoFrete, ServicosRegiao, type EscolhaServicos } from "@/components/entrega/info-entrega"
import { ResumoPrecoLista } from "@/components/entrega/resumo-preco"
import { OpcaoBotao } from "@/components/opcao-botao"
import { Passo } from "@/components/passo"
import { Calculadora } from "@/components/produto/calculadora"
import { Galeria, type ImagemGaleria } from "@/components/produto/galeria"
import { SimulacaoIA } from "@/components/produto/simulacao-ia"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { WhatsappLink } from "@/components/whatsapp-link"
import { textoPrazo } from "@/lib/catalogo"
import {
  mensagemDuvidaProduto,
  novaParede,
  opcoesPadrao,
  paredeFormParaParede,
  personalizacoesEscolhidas,
  textoPersonalizacoes,
  type ParedeForm,
} from "@/lib/configurador"
import {
  calcularAplicacao,
  calcularMetragem,
  calcularResumo,
  formatarMoeda,
  precoM2ComAcrescimos,
  type LocalEntrega,
} from "@/lib/pricing"
import { useHidratado, useLoja } from "@/lib/store"
import { useBarraInferior, useOcultarWhatsappDesktop } from "@/lib/use-barra-inferior"
import { cn } from "@/lib/utils"
import type { Product, SimulacaoIA as SimulacaoEscolhida } from "@/types"

export function ProdutoDetalhe({ slug }: { slug: string }) {
  const hidratado = useHidratado()
  const produto = useLoja((s) => s.produtos.find((p) => p.slug === slug))

  if (!produto || !produto.ativo) {
    if (!hidratado) {
      return <div className="container-loja min-h-[60vh] py-10" aria-busy="true" />
    }
    return (
      <div className="container-loja flex flex-col items-start gap-4 py-16">
        <h1 className="text-3xl font-semibold">Papel de parede não encontrado</h1>
        <p>Ele pode ter saído do catálogo. Veja os outros modelos.</p>
        <Link href="/produtos" className={buttonVariants()}>
          Ver papéis de parede
        </Link>
      </div>
    )
  }

  return <Configurador key={produto.id} produto={produto} />
}

function imagensDaCor(produto: Product, corId: string): ImagemGaleria[] {
  const cor = produto.cores.find((c) => c.id === corId)
  const fotosDeCor = new Set(produto.cores.map((c) => c.imagem).filter(Boolean))
  const outras = produto.imagens.filter((i) => !fotosDeCor.has(i.url))
  const principal = cor?.imagem
    ? { url: cor.imagem, alt: `${produto.nome} na cor ${cor.nome} — amostra` }
    : produto.imagens[0]
  return principal ? [principal, ...outras.filter((i) => i.url !== principal.url)] : outras
}

function Configurador({ produto }: { produto: Product }) {
  const settings = useLoja((s) => s.settings)
  const cep = useLoja((s) => s.cep)
  const definirCep = useLoja((s) => s.definirCep)
  const adicionarAoCarrinho = useLoja((s) => s.adicionarAoCarrinho)

  const [corId, setCorId] = useState(produto.cores[0]?.id ?? "")
  const [escolhas, setEscolhas] = useState(() => opcoesPadrao(produto))
  const [paredes, setParedes] = useState<ParedeForm[]>(() => [novaParede()])
  const [servicos, setServicos] = useState<EscolhaServicos>({ aplicacao: null, visita: null })
  const [simulacao, setSimulacao] = useState<SimulacaoEscolhida | undefined>(undefined)
  const [erroMedidas, setErroMedidas] = useState(false)
  const [adicionado, setAdicionado] = useState(false)
  const [detalhesAbertos, setDetalhesAbertos] = useState(false)
  const barraRef = useBarraInferior<HTMLDivElement>()
  useOcultarWhatsappDesktop()

  const cor = produto.cores.find((c) => c.id === corId) ?? produto.cores[0]
  const personalizacoes = personalizacoesEscolhidas(produto, escolhas)
  const precoFinal = precoM2ComAcrescimos(produto.precoM2, personalizacoes)
  const paredesNumeros = paredes.map(paredeFormParaParede)
  const metragem = calcularMetragem(paredesNumeros, settings.margemPerda)

  const resultadoCep = useResultadoCep(cep)
  const local: LocalEntrega =
    resultadoCep?.tipo === "atendida"
      ? { tipo: "atendida", cidade: resultadoCep.cidade }
      : resultadoCep
        ? { tipo: "frete", regiao: resultadoCep.regiao }
        : null
  const naRegiao = local?.tipo === "atendida"
  const servicosItem = {
    aplicacao: naRegiao && servicos.aplicacao === true,
    visita: naRegiao && servicos.visita === true,
  }
  const resumo = calcularResumo(
    [{ m2: metragem.m2, m2Parede: metragem.areaLiquida, precoM2: precoFinal, servicos: servicosItem }],
    local,
    settings,
  )

  const imagens = imagensDaCor(produto, cor?.id ?? "")
  const temPersonalizacao = produto.gruposPersonalizacao.length > 0
  const temIA = produto.iaHabilitada
  // Numeração dos passos conforme o que o produto tem
  const ordem = ["cor", temPersonalizacao && "personalizar", temIA && "ia", "medidas", "entrega"].filter(Boolean)
  const nPasso = (nome: string) => ordem.indexOf(nome) + 1

  // Indicação de "você está aqui": o primeiro passo ainda não resolvido
  const medidasOk = metragem.m2 > 0
  const entregaOk = Boolean(local) && (!naRegiao || (servicos.aplicacao !== null && servicos.visita !== null))
  const passoAtual = !medidasOk ? "medidas" : !entregaOk ? "entrega" : null

  const mensagemWhatsapp = mensagemDuvidaProduto({
    produto,
    cor: cor?.nome ?? "",
    personalizacoes,
    m2: metragem.m2,
  })

  function adicionar() {
    if (!medidasOk) {
      setErroMedidas(true)
      setDetalhesAbertos(false)
      const secao = document.getElementById("medidas")
      secao?.scrollIntoView({ behavior: "smooth", block: "start" })
      secao?.querySelector("input")?.focus({ preventScroll: true })
      return
    }
    adicionarAoCarrinho({
      produtoId: produto.id,
      produtoNome: produto.nome,
      produtoSlug: produto.slug,
      imagem: imagens[0]?.url ?? "",
      cor: { nome: cor?.nome ?? "", hex: cor?.hex ?? "" },
      personalizacoes,
      paredes: paredesNumeros,
      m2: metragem.m2,
      m2Parede: metragem.areaLiquida,
      precoM2: precoFinal,
      servicos: servicosItem,
      simulacao,
      prontaEntrega: produto.prontaEntrega,
      prazoProducaoDias: produto.prazoProducaoDias,
    })
    setDetalhesAbertos(false)
    setAdicionado(true)
  }

  const botaoAdicionar = (classe?: string) => (
    <Button size="lg" className={cn("w-full", classe)} onClick={adicionar}>
      <ShoppingBagIcon aria-hidden />
      Adicionar ao carrinho
    </Button>
  )

  return (
    <>
      <div className="container-loja flex flex-col gap-6 pt-4 pb-10 lg:pt-8">
        <Link
          href="/produtos"
          className="inline-flex min-h-12 items-center gap-2 self-start font-medium underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="size-5" aria-hidden />
          Voltar para os papéis de parede
        </Link>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-6 md:grid md:grid-cols-[1.25fr_1fr] md:gap-8">
              <Galeria imagens={imagens} regua={produto.regua} />

              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-semibold md:text-4xl">{produto.nome}</h1>
                <p className="text-2xl">
                  <strong className="font-bold">{formatarMoeda(precoFinal)}</strong>
                  <span className="text-foreground-subtle">/m²</span>
                </p>
                <p
                  data-slot="prazo"
                  className={cn(
                    "flex items-start gap-2 rounded-md border p-3 font-semibold",
                    produto.prontaEntrega ? "border-primary/40 bg-primary-soft/60 text-primary" : "border-border bg-surface-raised",
                  )}
                >
                  {produto.prontaEntrega ? (
                    <PackageCheckIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
                  ) : (
                    <ClockIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
                  )}
                  {textoPrazo(produto)}
                </p>
                <p className="text-foreground-subtle">{produto.descricao}</p>
              </div>
            </div>

            <Passo numero={nPasso("cor")} titulo="Escolha a cor" concluido={Boolean(cor)} descricao={cor && <>Cor escolhida: <strong className="text-foreground">{cor.nome}</strong></>}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {produto.cores.map((c) => (
                  <OpcaoBotao key={c.id} ativo={c.id === cor?.id} onClick={() => setCorId(c.id)}>
                    <span aria-hidden className="size-8 shrink-0 rounded-[3px] border border-foreground/30" style={{ backgroundColor: c.hex }} />
                    {c.nome}
                  </OpcaoBotao>
                ))}
              </div>
            </Passo>

            {temPersonalizacao && (
              <Passo numero={nPasso("personalizar")} titulo="Personalize" concluido>
                <div className="flex flex-col gap-5">
                  {produto.gruposPersonalizacao.map((g) => (
                    <fieldset key={g.id} className="flex flex-col gap-2">
                      <legend className="mb-2 font-semibold">{g.nome}</legend>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {g.opcoes.map((o) => (
                          <OpcaoBotao
                            key={o.id}
                            ativo={escolhas[g.id] === o.id}
                            onClick={() => setEscolhas({ ...escolhas, [g.id]: o.id })}
                            className="justify-between sm:flex-col sm:items-start sm:justify-center sm:gap-0"
                          >
                            <span className="text-lg font-semibold">{o.rotulo}</span>
                            {o.acrescimoM2 ? (
                              <span className="text-sm whitespace-nowrap">+ {formatarMoeda(o.acrescimoM2)} por m²</span>
                            ) : null}
                          </OpcaoBotao>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </Passo>
            )}

            {temIA && (
              <Passo
                id="simulacao"
                numero={nPasso("ia")}
                titulo="Veja antes de comprar"
                concluido={Boolean(simulacao)}
                descricao="Opcional. Peça uma mudança na estampa ou veja o papel na foto da sua parede."
              >
                <SimulacaoIA
                  produto={produto.nome}
                  cor={cor?.nome ?? ""}
                  personalizacoes={textoPersonalizacoes(personalizacoes)}
                  amostra={imagens[0]?.url ?? ""}
                  sugestoes={produto.sugestoesIA}
                  valor={simulacao}
                  onChange={setSimulacao}
                />
              </Passo>
            )}

            <Passo
              id="medidas"
              numero={nPasso("medidas")}
              titulo="Medidas da parede"
              concluido={medidasOk}
              atual={passoAtual === "medidas"}
              descricao="Informe em metros. Pode usar vírgula ou ponto: 2,60 ou 2.60."
            >
              {erroMedidas && !medidasOk && (
                <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-semibold text-destructive">
                  Para adicionar ao carrinho, digite a largura e a altura da parede.
                </p>
              )}
              <Calculadora
                paredes={paredes}
                onChange={setParedes}
                metragem={metragem}
                margemPerda={settings.margemPerda}
                precoM2={precoFinal}
              />
            </Passo>

            <Passo
              id="entrega"
              numero={nPasso("entrega")}
              titulo="Entrega ou aplicação"
              concluido={entregaOk}
              atual={passoAtual === "entrega"}
              descricao="Pelo CEP calculamos o frete ou, na nossa região, a aplicação."
            >
              <CampoCep cep={cep} onConfirmar={definirCep} />
              {resultadoCep?.tipo === "atendida" && (
                <ServicosRegiao
                  cidade={resultadoCep.cidade.nome}
                  escolha={servicos}
                  onChange={setServicos}
                  valorAplicacao={calcularAplicacao(metragem.areaLiquida, settings.valorAplicacaoM2)}
                  valorAplicacaoM2={settings.valorAplicacaoM2}
                  valorVisita={settings.valorVisitaMedicao}
                  deslocamento={resultadoCep.cidade.taxaDeslocamento}
                />
              )}
              {resultadoCep?.tipo === "frete" && <InfoFrete resultado={resultadoCep} resumo={resumo} />}
            </Passo>

            {/* Resumo e ações no fim do fluxo (no celular; no computador ficam no card lateral) */}
            <section aria-labelledby="titulo-resumo-final" className="flex flex-col gap-4 border-t border-border pt-6 lg:hidden">
              <h2 id="titulo-resumo-final" className="text-xl font-semibold">
                Resumo do pedido
              </h2>
              <ResumoPrecoLista
                resumo={resumo}
                local={local}
                descontoPixPct={settings.descontoPix}
                m2={metragem.m2}
                precoM2={precoFinal}
              />
              {botaoAdicionar()}
              <WhatsappLink variant="outline" mensagem={mensagemWhatsapp} className="w-full">
                Tirar dúvidas no WhatsApp
              </WhatsappLink>
            </section>
          </div>

          <aside aria-label="Resumo do preço" className="hidden lg:sticky lg:top-24 lg:block">
            <div className="flex flex-col gap-5 rounded-md border border-border bg-surface-raised p-5">
              <h2 className="text-xl font-semibold">Resumo</h2>
              <ResumoPrecoLista
                resumo={resumo}
                local={local}
                descontoPixPct={settings.descontoPix}
                m2={metragem.m2}
                precoM2={precoFinal}
              />
              {botaoAdicionar()}
              <WhatsappLink variant="outline" mensagem={mensagemWhatsapp} className="w-full">
                Tirar dúvidas no WhatsApp
              </WhatsappLink>
            </div>
          </aside>
        </div>
      </div>

      {/* Barra fixa de preço no celular */}
      <div
        ref={barraRef}
        data-slot="barra-preco"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-raised px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(0_0_0/0.08)] lg:hidden"
      >
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground-subtle uppercase">Total</p>
              {medidasOk ? (
                <p className="text-2xl leading-tight font-bold text-primary tabular-nums">{formatarMoeda(resumo.total)}</p>
              ) : (
                <p className="text-lg leading-tight font-semibold">Informe as medidas</p>
              )}
              {resumo.total > 0 && settings.descontoPix > 0 && (
                <p className="text-sm text-foreground-subtle">
                  No Pix: <span className="font-semibold text-foreground tabular-nums">{formatarMoeda(resumo.totalPix)}</span>
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setDetalhesAbertos(true)} aria-haspopup="dialog">
              <ChevronUpIcon aria-hidden />
              Ver detalhes
            </Button>
          </div>
          {botaoAdicionar()}
        </div>
      </div>

      <Sheet open={detalhesAbertos} onOpenChange={setDetalhesAbertos}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Detalhes do preço</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-4">
            <ResumoPrecoLista
              resumo={resumo}
              local={local}
              descontoPixPct={settings.descontoPix}
              m2={metragem.m2}
              precoM2={precoFinal}
            />
            {!local && (
              <Button
                variant="outline"
                onClick={() => {
                  setDetalhesAbertos(false)
                  document.getElementById("entrega")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Informar CEP
              </Button>
            )}
            {botaoAdicionar()}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={adicionado} onOpenChange={setAdicionado}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionado ao carrinho</DialogTitle>
            <DialogDescription>
              {produto.nome} — {cor?.nome}, {metragem.m2.toLocaleString("pt-BR")} m².
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Link href="/carrinho" className={buttonVariants({ size: "lg" })}>
              Ver carrinho
            </Link>
            <Button variant="outline" onClick={() => setAdicionado(false)}>
              Continuar escolhendo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
