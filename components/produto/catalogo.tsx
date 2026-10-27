"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { SlidersHorizontalIcon, XIcon } from "lucide-react"
import { OpcaoBotao } from "@/components/opcao-botao"
import { BlocosAmbientes, PerguntasAmbiente } from "@/components/produto/filtro-ambientes"
import { GradeProdutos } from "@/components/produto/produto-card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { WhatsappLink } from "@/components/whatsapp-link"
import {
  alternarOpcao,
  ambientesVisiveis,
  escreverFiltroAmbiente,
  filtrarPorAmbiente,
  lerFiltroAmbiente,
  ordenarComSemente,
  SEM_AMBIENTE,
  textoFiltroAmbiente,
  type FiltroAmbiente,
} from "@/lib/ambientes"
import { ROTULO_CATEGORIA } from "@/lib/data"
import { categoriasDisponiveis, coresDisponiveis, ehCategoria, filtrarProdutos, materiaisDisponiveis } from "@/lib/catalogo"
import { useLoja, useProdutosAtivos } from "@/lib/store"
import { salvarUltimoAmbiente, useSementeSessao } from "@/lib/use-sessao-catalogo"
import type { Categoria, Product } from "@/types"

interface Filtros {
  categoria: Categoria | null
  cor: string | null
  material: string | null
  ambiente: FiltroAmbiente
}

const SEM_FILTROS: Filtros = { categoria: null, cor: null, material: null, ambiente: SEM_AMBIENTE }

function contarPapeis(n: number) {
  return `${n} ${n === 1 ? "papel encontrado" : "papéis encontrados"}`
}

/** Estilo, cor e material: coluna no desktop, gaveta "Mais filtros" no celular. */
function PainelFiltros({
  produtos,
  filtros,
  alterar,
}: {
  produtos: Product[]
  filtros: Filtros
  alterar: (f: Partial<Filtros>) => void
}) {
  const categorias = categoriasDisponiveis(produtos)
  // Só as cores que existem no estilo escolhido (evita filtro que não dá resultado)
  const cores = coresDisponiveis(
    filtros.categoria ? produtos.filter((p) => p.categoria === filtros.categoria) : produtos,
  )
  const materiais = materiaisDisponiveis(produtos)
  return (
    <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-xl font-medium">Tipo de estampa</legend>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <OpcaoBotao ativo={!filtros.categoria} onClick={() => alterar({ categoria: null })}>
            Todos
          </OpcaoBotao>
          {categorias.map((c) => (
            <OpcaoBotao key={c} ativo={filtros.categoria === c} onClick={() => alterar({ categoria: c })}>
              {ROTULO_CATEGORIA[c]}
            </OpcaoBotao>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-xl font-medium">Cor</legend>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <OpcaoBotao ativo={!filtros.cor} onClick={() => alterar({ cor: null })}>
            Todas
          </OpcaoBotao>
          {cores.map((c) => (
            <OpcaoBotao key={c.chave} ativo={filtros.cor === c.chave} onClick={() => alterar({ cor: c.chave })}>
              <span
                aria-hidden
                className="size-6 shrink-0 rounded-[2px] border border-foreground/30"
                style={{ backgroundColor: c.hex }}
              />
              {c.nome}
            </OpcaoBotao>
          ))}
        </div>
      </fieldset>
      {materiais.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-heading text-xl font-medium">Material</legend>
          <div className="grid gap-2">
            <OpcaoBotao ativo={!filtros.material} onClick={() => alterar({ material: null })}>
              Todos
            </OpcaoBotao>
            {materiais.map((m) => (
              <OpcaoBotao key={m.id} ativo={filtros.material === m.id} onClick={() => alterar({ material: m.id })}>
                {m.nome}
              </OpcaoBotao>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}

interface CatalogoProps {
  titulo: string
  descricao?: React.ReactNode
  /** Mostra só produtos de pronta entrega */
  somenteProntaEntrega?: boolean
}

/**
 * Catálogo com os filtros lidos da URL
 * (?ambiente=quarto&idade=infantil&para-quem=menina&categoria=…&cor=…&material=…). Precisa de <Suspense> na página.
 */
export function Catalogo(props: CatalogoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const ambientes = useLoja((s) => s.ambientes)

  const categoriaParam = params.get("categoria")
  const filtros: Filtros = {
    categoria: ehCategoria(categoriaParam) ? categoriaParam : null,
    cor: params.get("cor"),
    material: params.get("material"),
    ambiente: lerFiltroAmbiente(params, ambientes),
  }

  const buscaAmbiente = new URLSearchParams()
  escreverFiltroAmbiente(buscaAmbiente, filtros.ambiente)
  const qsAmbiente = buscaAmbiente.toString()
  // Lembra o ambiente procurado, para a mensagem de dúvida na página do produto
  useEffect(() => salvarUltimoAmbiente(qsAmbiente), [qsAmbiente])

  function alterar(novo: Partial<Filtros>) {
    const proximo = { ...filtros, ...novo }
    const busca = new URLSearchParams()
    escreverFiltroAmbiente(busca, proximo.ambiente)
    if (proximo.categoria) busca.set("categoria", proximo.categoria)
    if (proximo.cor) busca.set("cor", proximo.cor)
    if (proximo.material) busca.set("material", proximo.material)
    const qs = busca.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return <CatalogoConteudo {...props} filtros={filtros} alterar={alterar} />
}

/**
 * Fallback do <Suspense>: o catálogo completo, sem filtros. Assim o HTML estático já traz
 * os produtos e a página não "pula" quando os filtros da URL são lidos.
 */
export function CatalogoSemFiltros(props: CatalogoProps) {
  return <CatalogoConteudo {...props} filtros={SEM_FILTROS} alterar={() => {}} />
}

function CatalogoConteudo({
  titulo,
  descricao,
  somenteProntaEntrega,
  filtros,
  alterar,
}: CatalogoProps & { filtros: Filtros; alterar: (f: Partial<Filtros>) => void }) {
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const semente = useSementeSessao()
  const taxonomia = useLoja((s) => s.ambientes)

  const ativos = useProdutosAtivos()
  const produtos = somenteProntaEntrega ? ativos.filter((p) => p.prontaEntrega) : ativos
  const ambientes = ambientesVisiveis(taxonomia, produtos)
  const ambiente = ambientes.find((a) => a.slug === filtros.ambiente.ambiente) ?? null

  const porOutrosFiltros = filtrarProdutos(produtos, filtros)
  const encontrados = filtrarPorAmbiente(porOutrosFiltros, ambientes, filtros.ambiente)
  const resultado = ordenarComSemente(encontrados, semente, (r) => r.produto.id)
  const selos = Object.fromEntries(resultado.filter((r) => r.combinaComTodos).map((r) => [r.produto.id, "Combina com todos"]))

  const corAtiva = filtros.cor ? coresDisponiveis(produtos).find((c) => c.chave === filtros.cor) : undefined
  const materialAtivo = filtros.material ? materiaisDisponiveis(produtos).find((m) => m.id === filtros.material) : undefined
  const qtdMaisFiltros = (filtros.categoria ? 1 : 0) + (filtros.cor ? 1 : 0) + (filtros.material ? 1 : 0)

  const etiquetas: { chave: string; rotulo: string; remover: () => void }[] = []
  if (ambiente) {
    etiquetas.push({ chave: "ambiente", rotulo: ambiente.nome, remover: () => alterar({ ambiente: SEM_AMBIENTE }) })
    for (const g of ambiente.grupos) {
      for (const o of g.opcoes.filter((o) => filtros.ambiente.opcoes[g.slug]?.includes(o.slug))) {
        etiquetas.push({ chave: o.id, rotulo: o.nome, remover: () => alterar({ ambiente: alternarOpcao(filtros.ambiente, g, o.slug) }) })
      }
    }
  }
  if (filtros.categoria)
    etiquetas.push({ chave: "categoria", rotulo: ROTULO_CATEGORIA[filtros.categoria], remover: () => alterar({ categoria: null }) })
  if (filtros.cor) etiquetas.push({ chave: "cor", rotulo: corAtiva?.nome ?? filtros.cor, remover: () => alterar({ cor: null }) })
  if (filtros.material)
    etiquetas.push({ chave: "material", rotulo: materialAtivo?.nome ?? filtros.material, remover: () => alterar({ material: null }) })

  const limpar = () => alterar(SEM_FILTROS)
  const contagem = contarPapeis(resultado.length)

  // Sem resultado: outros papéis do mesmo ambiente (sem as outras escolhas)
  const sugestoes = ambiente
    ? ordenarComSemente(
        filtrarPorAmbiente(produtos, ambientes, { ambiente: ambiente.slug, opcoes: {} }).map((r) => r.produto),
        semente,
        (p) => p.id,
      ).slice(0, 4)
    : []
  const procura = [
    textoFiltroAmbiente(filtros.ambiente, ambientes),
    filtros.categoria && `estampa: ${ROTULO_CATEGORIA[filtros.categoria]}`,
    corAtiva && `cor: ${corAtiva.nome}`,
    materialAtivo && `material: ${materialAtivo.nome}`,
  ].filter(Boolean)
  const mensagemPersonalizado = [
    "Olá! Não encontrei no site um papel de parede para o que procuro e gostaria de um papel personalizado.",
    procura.length ? `O que procuro: ${procura.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return (
    <div className="container-loja flex flex-col gap-6 py-8 md:py-12">
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl">{titulo}</h1>
        {descricao && <div className="max-w-prose text-foreground-subtle">{descricao}</div>}
      </header>

      {ambientes.length > 0 && (
        <section aria-labelledby="titulo-ambientes" className="flex flex-col gap-4">
          <h2 id="titulo-ambientes" className="text-2xl md:text-3xl">
            Para qual ambiente?
          </h2>
          <BlocosAmbientes
            ambientes={ambientes}
            escolhido={ambiente?.slug ?? null}
            onEscolher={(slug) => {
              alterar({ ambiente: slug ? { ambiente: slug, opcoes: {} } : SEM_AMBIENTE })
              // Leva direto aos resultados (depois que as perguntas abrem e a página muda de altura)
              if (slug) {
                const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                window.setTimeout(
                  () => document.getElementById("resultados")?.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" }),
                  suave ? 320 : 0,
                )
              }
            }}
          />
          <PerguntasAmbiente
            ambiente={ambiente}
            filtro={filtros.ambiente}
            onAlternar={(g, opcao) => alterar({ ambiente: alternarOpcao(filtros.ambiente, g, opcao) })}
          />
        </section>
      )}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside aria-label="Mais filtros" className="hidden lg:block">
          <PainelFiltros produtos={produtos} filtros={filtros} alterar={alterar} />
        </aside>

        <div id="resultados" className="flex scroll-mt-24 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" data-slot="contador" className="text-lg font-medium">
              {contagem}
            </p>
            <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
                <SlidersHorizontalIcon aria-hidden />
                Mais filtros{qtdMaisFiltros > 0 && ` (${qtdMaisFiltros})`}
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Mais filtros</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <PainelFiltros produtos={produtos} filtros={filtros} alterar={alterar} />
                </div>
                <SheetFooter className="sticky bottom-0 bg-popover">
                  <Button size="lg" className="w-full" onClick={() => setGavetaAberta(false)}>
                    Ver {resultado.length} {resultado.length === 1 ? "papel" : "papéis"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {etiquetas.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Filtros escolhidos">
              {etiquetas.map((e) => (
                <li key={e.chave}>
                  <Button variant="secondary" size="sm" data-slot="etiqueta-filtro" onClick={e.remover}>
                    {e.rotulo}
                    <XIcon aria-hidden />
                    <span className="sr-only">(remover filtro)</span>
                  </Button>
                </li>
              ))}
              <li>
                <Button variant="link" size="sm" className="min-h-12" onClick={limpar}>
                  Limpar filtros
                </Button>
              </li>
            </ul>
          )}

          {resultado.length > 0 ? (
            <GradeProdutos
              produtos={resultado.map((r) => r.produto)}
              selos={selos}
              className="lg:grid-cols-3"
              nivelTitulo={2}
            />
          ) : (
            <div className="flex flex-col gap-8">
              <div data-slot="sem-resultado" className="flex flex-col items-start gap-4 rounded-md border border-border bg-surface p-6">
                <p className="font-heading text-2xl text-foreground-heading">Ainda não temos papéis cadastrados para essa combinação.</p>
                <p className="max-w-prose text-foreground-subtle">
                  Podemos fazer um papel personalizado para você. Conte pelo WhatsApp o que procura.
                </p>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <WhatsappLink mensagem={mensagemPersonalizado}>Pedir um papel personalizado no WhatsApp</WhatsappLink>
                  <Button variant="outline" onClick={limpar}>
                    Limpar filtros
                  </Button>
                </div>
              </div>
              {sugestoes.length > 0 && ambiente && (
                <section aria-labelledby="titulo-sugestoes" className="flex flex-col gap-4">
                  <h2 id="titulo-sugestoes" className="text-2xl">
                    Outros papéis para {ambiente.nome}
                  </h2>
                  <GradeProdutos produtos={sugestoes} className="lg:grid-cols-3" />
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
