"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, ExternalLinkIcon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { CampoArea, CampoSelect, CampoTexto, EnviarFotos, ErroCampo, Interruptor, SecaoAdmin } from "@/components/admin/campos"
import { FotosProduto } from "@/components/admin/fotos-produto"
import { ReguaCalibracao } from "@/components/admin/regua-calibracao"
import { Galeria } from "@/components/produto/galeria"
import { Button, buttonVariants } from "@/components/ui/button"
import { moverItem, slugificar, validarProduto, type ErrosProduto, type ProdutoForm as Form } from "@/lib/admin-produto"
import { ROTULO_CATEGORIA } from "@/lib/data"
import { gerarIdSimples } from "@/lib/id"
import { parseDecimal } from "@/lib/pricing"
import { useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"
import { CATEGORIAS, type Categoria, type Regua } from "@/types"

interface ProdutoFormProps {
  inicial: Form
  novo: boolean
}

function BotaoRemover({ onClick, rotulo }: { onClick: () => void; rotulo: string }) {
  return (
    <Button variant="outline" size="sm" className="text-destructive" onClick={onClick}>
      <Trash2Icon aria-hidden />
      Remover <span className="sr-only">{rotulo}</span>
    </Button>
  )
}

function BotoesOrdem({ indice, total, onMover, rotulo }: { indice: number; total: number; onMover: (d: -1 | 1) => void; rotulo: string }) {
  return (
    <>
      <Button variant="outline" size="sm" disabled={indice === 0} onClick={() => onMover(-1)}>
        <ArrowUpIcon aria-hidden />
        Subir <span className="sr-only">{rotulo}</span>
      </Button>
      <Button variant="outline" size="sm" disabled={indice === total - 1} onClick={() => onMover(1)}>
        <ArrowDownIcon aria-hidden />
        Descer <span className="sr-only">{rotulo}</span>
      </Button>
    </>
  )
}

/** Régua do formulário em números (para a pré-visualização igual à do cliente). */
function reguaDaForma(f: Form): Regua | null {
  const px = parseDecimal(f.regua.pixelsPorCm)
  if (!px || px <= 0) return null
  return {
    pixelsPorCm: px,
    medidas: f.regua.medidas.flatMap((m) => {
      const l = parseDecimal(m.larguraCm)
      if (!l || l <= 0 || !m.rotulo.trim()) return []
      return [{ id: m.id, rotulo: m.rotulo.trim(), larguraCm: l, alturaCm: parseDecimal(m.alturaCm) ?? 0 }]
    }),
  }
}

export function ProdutoForm({ inicial, novo }: ProdutoFormProps) {
  const produtos = useLoja((s) => s.produtos)
  const salvarProduto = useLoja((s) => s.salvarProduto)
  const [f, setF] = useState<Form>(inicial)
  const [erros, setErros] = useState<ErrosProduto>({})
  const [alterado, setAlterado] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [slugManual, setSlugManual] = useState(!novo)
  const [ehNovo, setEhNovo] = useState(novo)

  const salvoNaLoja = produtos.find((p) => p.id === f.id)

  function alterar(dados: Partial<Form>) {
    setF((atual) => ({ ...atual, ...dados }))
    setAlterado(true)
    setMensagem(null)
  }

  function salvar() {
    const { produto, erros: novos } = validarProduto(f, produtos)
    setErros(novos)
    if (!produto) {
      setMensagem(null)
      requestAnimationFrame(() => {
        document.querySelector("[data-slot=resumo-erros]")?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
      return
    }
    salvarProduto(produto)
    setF((atual) => ({ ...atual, slug: produto.slug }))
    setAlterado(false)
    setMensagem("Alterações salvas. Já aparecem na loja.")
    if (ehNovo) {
      // Troca a URL sem remontar o formulário (a mensagem de "salvo" continua na tela)
      window.history.replaceState(null, "", `/admin/produtos/${produto.id}`)
      setEhNovo(false)
    }
  }

  const qtdErros = Object.keys(erros).length
  const regua = reguaDaForma(f)
  const principal = f.imagens[0]?.url

  return (
    <div className="flex flex-col">
      <div className="container-loja flex flex-col gap-6 py-8">
        <Link href="/admin/produtos" className="inline-flex min-h-12 items-center gap-2 self-start font-medium underline-offset-4 hover:underline">
          <ArrowLeftIcon className="size-5" aria-hidden />
          Voltar para a lista
        </Link>
        <h1 className="text-3xl font-semibold">{ehNovo ? "Novo papel de parede" : `Editar: ${f.nome || inicial.nome}`}</h1>

        {qtdErros > 0 && (
          <div data-slot="resumo-erros" role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
            <p className="font-bold text-destructive">
              {qtdErros === 1 ? "Falta corrigir 1 campo." : `Falta corrigir ${qtdErros} campos.`} As mensagens estão em vermelho
              abaixo.
            </p>
          </div>
        )}

        {/* a) Dados básicos */}
        <SecaoAdmin titulo="Dados básicos">
          <CampoTexto
            rotulo="Nome"
            valor={f.nome}
            onChange={(nome) => alterar({ nome, ...(slugManual ? {} : { slug: slugificar(nome) }) })}
            erro={erros.nome}
          />
          <CampoTexto
            rotulo="Endereço da página"
            ajuda={<>Fica assim: /produtos/{f.slug || slugificar(f.nome) || "nome-do-papel"}</>}
            valor={f.slug}
            onChange={(slug) => {
              setSlugManual(true)
              alterar({ slug: slugificar(slug) })
            }}
            erro={erros.slug}
          />
          <CampoArea rotulo="Descrição" valor={f.descricao} onChange={(descricao) => alterar({ descricao })} rows={4} />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect rotulo="Estilo (categoria)" valor={f.categoria} onChange={(v) => alterar({ categoria: v as Categoria })}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {ROTULO_CATEGORIA[c]}
                </option>
              ))}
            </CampoSelect>
            <CampoTexto
              rotulo="Preço por m²"
              valor={f.precoM2}
              onChange={(precoM2) => alterar({ precoM2 })}
              inputMode="decimal"
              sufixo="R$/m²"
              erro={erros.precoM2}
            />
          </div>
          <Interruptor
            rotulo="Pronta entrega"
            descricao="Envio imediato (aparece na aba Pronta entrega)"
            marcado={f.prontaEntrega}
            onChange={(prontaEntrega) => alterar({ prontaEntrega })}
          />
          {!f.prontaEntrega && (
            <CampoTexto
              rotulo="Prazo de produção"
              valor={f.prazoProducaoDias}
              onChange={(prazoProducaoDias) => alterar({ prazoProducaoDias })}
              inputMode="numeric"
              sufixo="dias úteis"
              erro={erros.prazoProducaoDias}
              className="sm:max-w-xs"
            />
          )}
          <Interruptor
            rotulo="Ativo (à venda na loja)"
            descricao="Desligado: some da loja, mas continua salvo aqui"
            marcado={f.ativo}
            onChange={(ativo) => alterar({ ativo })}
          />
        </SecaoAdmin>

        {/* b) Fotos */}
        <SecaoAdmin titulo="Fotos" descricao="A primeira é a principal: aparece no catálogo e recebe a régua.">
          <FotosProduto nomeProduto={f.nome} imagens={f.imagens} onChange={(imagens) => alterar({ imagens })} erro={erros.imagens} />
        </SecaoAdmin>

        {/* c) Cores */}
        <SecaoAdmin titulo="Cores" descricao="Ao escolher a cor na loja, a foto da variação substitui a principal.">
          <ul className="flex flex-col gap-4">
            {f.cores.map((c, i) => {
              const atualizar = (dados: Partial<Form["cores"][number]>) =>
                alterar({ cores: f.cores.map((x) => (x.id === c.id ? { ...x, ...dados } : x)) })
              return (
                <li key={c.id} data-slot="cor-admin" className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <CampoTexto rotulo={`Nome da cor ${i + 1}`} valor={c.nome} onChange={(nome) => atualizar({ nome })} erro={erros[`cores.${i}.nome`]} />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`cor-${c.id}`} className="font-semibold">
                        Tom
                      </label>
                      <input
                        id={`cor-${c.id}`}
                        type="color"
                        value={c.hex}
                        onChange={(e) => atualizar({ hex: e.target.value })}
                        className="h-14 w-full cursor-pointer rounded-md border border-input bg-surface-raised p-1 sm:w-24"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {c.imagem ? (
                      // eslint-disable-next-line @next/next/no-img-element -- base64 ou /public
                      <img src={c.imagem} alt={`Foto da cor ${c.nome}`} className="size-16 rounded-sm border border-border object-cover" />
                    ) : (
                      <span className="text-foreground-subtle">Sem foto da variação.</span>
                    )}
                    <EnviarFotos
                      rotulo={c.imagem ? "Trocar foto" : "Enviar foto da cor"}
                      multiplas={false}
                      onFotos={([url]) => atualizar({ imagem: url })}
                    />
                    {c.imagem && (
                      <Button variant="outline" size="sm" onClick={() => atualizar({ imagem: undefined })}>
                        Tirar foto <span className="sr-only">da cor {c.nome}</span>
                      </Button>
                    )}
                    {f.cores.length > 1 && (
                      <BotaoRemover rotulo={`cor ${c.nome || i + 1}`} onClick={() => alterar({ cores: f.cores.filter((x) => x.id !== c.id) })} />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <ErroCampo>{erros.cores}</ErroCampo>
          <Button
            variant="outline"
            className="sm:self-start"
            onClick={() => alterar({ cores: [...f.cores, { id: gerarIdSimples("c"), nome: "", hex: "#d9cbb4" }] })}
          >
            <PlusIcon aria-hidden />
            Adicionar cor
          </Button>
        </SecaoAdmin>

        {/* d) Personalizações */}
        <SecaoAdmin titulo="Personalizações" descricao="Opções fixas que o cliente escolhe (ex.: largura da listra 3/5/8 cm). O acréscimo é opcional.">
          <ul className="flex flex-col gap-4">
            {f.gruposPersonalizacao.map((g, i) => {
              const atualizarGrupo = (dados: Partial<Form["gruposPersonalizacao"][number]>) =>
                alterar({ gruposPersonalizacao: f.gruposPersonalizacao.map((x) => (x.id === g.id ? { ...x, ...dados } : x)) })
              return (
                <li key={g.id} data-slot="grupo-admin" className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-4">
                  <CampoTexto
                    rotulo={`Nome do grupo ${i + 1}`}
                    placeholder="Ex.: Tamanho da estampa"
                    valor={g.nome}
                    onChange={(nome) => atualizarGrupo({ nome })}
                    erro={erros[`grupos.${i}.nome`]}
                  />
                  <ol className="flex flex-col gap-3">
                    {g.opcoes.map((o, j) => {
                      const atualizarOpcao = (dados: Partial<(typeof g.opcoes)[number]>) =>
                        atualizarGrupo({ opcoes: g.opcoes.map((x) => (x.id === o.id ? { ...x, ...dados } : x)) })
                      return (
                        <li key={o.id} className="flex flex-col gap-2 rounded-md border border-border bg-muted/50 p-3">
                          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,9rem)] gap-3">
                            <CampoTexto
                              rotulo={`Opção ${j + 1}`}
                              placeholder="Ex.: 5 cm"
                              valor={o.rotulo}
                              onChange={(rotulo) => atualizarOpcao({ rotulo })}
                              erro={erros[`grupos.${i}.opcoes.${j}.rotulo`]}
                            />
                            <CampoTexto
                              rotulo="Acréscimo"
                              placeholder="0"
                              inputMode="decimal"
                              sufixo="R$/m²"
                              valor={o.acrescimoM2}
                              onChange={(acrescimoM2) => atualizarOpcao({ acrescimoM2 })}
                              erro={erros[`grupos.${i}.opcoes.${j}.acrescimo`]}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <BotoesOrdem
                              indice={j}
                              total={g.opcoes.length}
                              rotulo={`opção ${o.rotulo || j + 1}`}
                              onMover={(d) => atualizarGrupo({ opcoes: moverItem(g.opcoes, j, d) })}
                            />
                            <BotaoRemover
                              rotulo={`opção ${o.rotulo || j + 1}`}
                              onClick={() => atualizarGrupo({ opcoes: g.opcoes.filter((x) => x.id !== o.id) })}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                  <ErroCampo>{erros[`grupos.${i}.opcoes`]}</ErroCampo>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => atualizarGrupo({ opcoes: [...g.opcoes, { id: gerarIdSimples("o"), rotulo: "", acrescimoM2: "" }] })}
                    >
                      <PlusIcon aria-hidden />
                      Adicionar opção <span className="sr-only">ao grupo {g.nome || i + 1}</span>
                    </Button>
                    <BotoesOrdem
                      indice={i}
                      total={f.gruposPersonalizacao.length}
                      rotulo={`grupo ${g.nome || i + 1}`}
                      onMover={(d) => alterar({ gruposPersonalizacao: moverItem(f.gruposPersonalizacao, i, d) })}
                    />
                    <BotaoRemover
                      rotulo={`grupo ${g.nome || i + 1}`}
                      onClick={() => alterar({ gruposPersonalizacao: f.gruposPersonalizacao.filter((x) => x.id !== g.id) })}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <Button
            variant="outline"
            className="sm:self-start"
            onClick={() =>
              alterar({
                gruposPersonalizacao: [
                  ...f.gruposPersonalizacao,
                  { id: gerarIdSimples("g"), nome: "", opcoes: [{ id: gerarIdSimples("o"), rotulo: "", acrescimoM2: "" }] },
                ],
              })
            }
          >
            <PlusIcon aria-hidden />
            Adicionar grupo
          </Button>
        </SecaoAdmin>

        {/* e) Régua */}
        <SecaoAdmin titulo="Régua" descricao="Mostra ao cliente o tamanho real da estampa sobre a foto principal.">
          <ReguaCalibracao
            key={principal}
            imagem={principal}
            pixelsPorCm={f.regua.pixelsPorCm}
            onCalibrar={(pixelsPorCm) => alterar({ regua: { ...f.regua, pixelsPorCm } })}
          />
          <CampoTexto
            rotulo="Pixels por cm (ajuste fino)"
            ajuda="Preenchido pela calibração. Só mude se souber o valor."
            valor={f.regua.pixelsPorCm}
            onChange={(pixelsPorCm) => alterar({ regua: { ...f.regua, pixelsPorCm } })}
            inputMode="decimal"
            erro={erros["regua.pixelsPorCm"]}
            className="sm:max-w-xs"
          />

          <h3 className="font-sans text-lg font-bold">Medidas do elemento</h3>
          <ul className="flex flex-col gap-3">
            {f.regua.medidas.map((m, i) => {
              const atualizar = (dados: Partial<(typeof f.regua.medidas)[number]>) =>
                alterar({ regua: { ...f.regua, medidas: f.regua.medidas.map((x) => (x.id === m.id ? { ...x, ...dados } : x)) } })
              return (
                <li key={m.id} data-slot="medida-admin" className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-3">
                  <CampoTexto
                    rotulo={`Nome da medida ${i + 1}`}
                    placeholder="Ex.: Cada quadrado"
                    valor={m.rotulo}
                    onChange={(rotulo) => atualizar({ rotulo })}
                    erro={erros[`medidas.${i}.rotulo`]}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CampoTexto rotulo="Largura" sufixo="cm" inputMode="decimal" valor={m.larguraCm} onChange={(larguraCm) => atualizar({ larguraCm })} erro={erros[`medidas.${i}.largura`]} />
                    <CampoTexto rotulo="Altura (opcional)" sufixo="cm" inputMode="decimal" valor={m.alturaCm} onChange={(alturaCm) => atualizar({ alturaCm })} erro={erros[`medidas.${i}.altura`]} />
                  </div>
                  <BotaoRemover
                    rotulo={`medida ${m.rotulo || i + 1}`}
                    onClick={() => alterar({ regua: { ...f.regua, medidas: f.regua.medidas.filter((x) => x.id !== m.id) } })}
                  />
                </li>
              )
            })}
          </ul>
          <Button
            variant="outline"
            className="sm:self-start"
            onClick={() =>
              alterar({ regua: { ...f.regua, medidas: [...f.regua.medidas, { id: gerarIdSimples("m"), rotulo: "", larguraCm: "", alturaCm: "" }] } })
            }
          >
            <PlusIcon aria-hidden />
            Adicionar medida
          </Button>

          {principal && regua && (
            <div className="flex flex-col gap-2">
              <h3 className="font-sans text-lg font-bold">Como o cliente vê</h3>
              <Galeria imagens={[{ url: principal, alt: f.nome }]} regua={regua} className="sm:max-w-md" />
            </div>
          )}
        </SecaoAdmin>

        {/* f) IA */}
        <SecaoAdmin titulo="Simulação com IA" descricao="Permite ao cliente pedir mudanças na estampa e ver o papel na foto da parede.">
          <Interruptor rotulo="Simulação com IA ligada" marcado={f.iaHabilitada} onChange={(iaHabilitada) => alterar({ iaHabilitada })} />
          {f.iaHabilitada && (
            <>
              <p className="font-semibold">Sugestões de observação (o cliente toca para usar)</p>
              <ul className="flex flex-col gap-3">
                {f.sugestoesIA.map((s, i) => (
                  <li key={i} className="flex items-end gap-2">
                    <CampoTexto
                      rotulo={`Sugestão ${i + 1}`}
                      valor={s}
                      onChange={(v) => alterar({ sugestoesIA: f.sugestoesIA.map((x, j) => (j === i ? v : x)) })}
                      className="flex-1"
                    />
                    <BotaoRemover rotulo={`sugestão ${i + 1}`} onClick={() => alterar({ sugestoesIA: f.sugestoesIA.filter((_, j) => j !== i) })} />
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="sm:self-start" onClick={() => alterar({ sugestoesIA: [...f.sugestoesIA, ""] })}>
                <PlusIcon aria-hidden />
                Adicionar sugestão
              </Button>
            </>
          )}
        </SecaoAdmin>
      </div>

      {/* g) Rodapé fixo com as ações */}
      <div data-slot="acoes-produto" className="sticky bottom-0 z-30 border-t border-border bg-surface-raised/97 shadow-[0_-4px_16px_rgb(0_0_0/0.06)]">
        <div className="container-loja flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className={cn("text-sm font-semibold", mensagem ? "text-success" : "text-foreground-subtle")}>
            {mensagem ?? (alterado ? "Há alterações não salvas." : ehNovo ? "Preencha e toque em Salvar." : "Nada alterado.")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {salvoNaLoja ? (
              <a
                href={`/produtos/${salvoNaLoja.slug}${salvoNaLoja.ativo ? "" : "?previa=1"}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                <ExternalLinkIcon aria-hidden />
                Ver como o cliente vê
              </a>
            ) : (
              <Button variant="outline" disabled title="Salve primeiro">
                <ExternalLinkIcon aria-hidden />
                Ver como o cliente vê
              </Button>
            )}
            <Button onClick={salvar}>
              <SaveIcon aria-hidden />
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
