"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SlidersHorizontalIcon, XIcon } from "lucide-react"
import { OpcaoBotao } from "@/components/opcao-botao"
import { GradeProdutos } from "@/components/produto/produto-card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ROTULO_CATEGORIA } from "@/lib/data"
import { categoriasDisponiveis, coresDisponiveis, ehCategoria, filtrarProdutos } from "@/lib/catalogo"
import { useProdutosAtivos } from "@/lib/store"
import type { Categoria, Product } from "@/types"

interface Filtros {
  categoria: Categoria | null
  cor: string | null
}

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
  return (
    <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-xl font-medium">Estilo</legend>
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
    </div>
  )
}

interface CatalogoProps {
  titulo: string
  descricao?: React.ReactNode
  /** Mostra só produtos de pronta entrega */
  somenteProntaEntrega?: boolean
}

/** Catálogo com os filtros lidos da URL (?categoria=…&cor=…). Precisa de <Suspense> na página. */
export function Catalogo(props: CatalogoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const categoriaParam = params.get("categoria")
  const filtros: Filtros = {
    categoria: ehCategoria(categoriaParam) ? categoriaParam : null,
    cor: params.get("cor"),
  }

  function alterar(novo: Partial<Filtros>) {
    const proximo = { ...filtros, ...novo }
    const busca = new URLSearchParams()
    if (proximo.categoria) busca.set("categoria", proximo.categoria)
    if (proximo.cor) busca.set("cor", proximo.cor)
    const qs = busca.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return <CatalogoConteudo {...props} filtros={filtros} alterar={alterar} />
}

const SEM_FILTROS: Filtros = { categoria: null, cor: null }

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

  const ativos = useProdutosAtivos()
  const produtos = somenteProntaEntrega ? ativos.filter((p) => p.prontaEntrega) : ativos
  const resultado = filtrarProdutos(produtos, filtros)
  const corAtiva = filtros.cor ? coresDisponiveis(produtos).find((c) => c.chave === filtros.cor) : undefined
  const qtdFiltros = (filtros.categoria ? 1 : 0) + (filtros.cor ? 1 : 0)

  const contagem = `${resultado.length} ${resultado.length === 1 ? "papel de parede" : "papéis de parede"}`

  return (
    <div className="container-loja flex flex-col gap-6 py-8 md:py-12">
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl">{titulo}</h1>
        {descricao && <div className="max-w-prose text-foreground-subtle">{descricao}</div>}
      </header>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside aria-label="Filtros" className="hidden lg:block">
          <PainelFiltros produtos={produtos} filtros={filtros} alterar={alterar} />
        </aside>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="font-medium">
              {contagem}
            </p>
            <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
                <SlidersHorizontalIcon aria-hidden />
                Filtrar{qtdFiltros > 0 && ` (${qtdFiltros})`}
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Filtrar</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <PainelFiltros produtos={produtos} filtros={filtros} alterar={alterar} />
                </div>
                <SheetFooter className="sticky bottom-0 bg-popover">
                  <Button size="lg" className="w-full" onClick={() => setGavetaAberta(false)}>
                    Ver {contagem}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {qtdFiltros > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Filtros escolhidos">
              {filtros.categoria && (
                <Button variant="secondary" size="sm" onClick={() => alterar({ categoria: null })}>
                  {ROTULO_CATEGORIA[filtros.categoria]}
                  <XIcon aria-hidden />
                  <span className="sr-only">remover filtro</span>
                </Button>
              )}
              {filtros.cor && (
                <Button variant="secondary" size="sm" onClick={() => alterar({ cor: null })}>
                  {corAtiva?.nome ?? filtros.cor}
                  <XIcon aria-hidden />
                  <span className="sr-only">remover filtro</span>
                </Button>
              )}
              <Button variant="link" size="sm" className="min-h-12" onClick={() => alterar({ categoria: null, cor: null })}>
                Limpar filtros
              </Button>
            </div>
          )}

          {resultado.length > 0 ? (
            <GradeProdutos produtos={resultado} className="lg:grid-cols-3" nivelTitulo={2} />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-md border border-border bg-surface p-6">
              <p className="text-lg">Nenhum papel de parede com esses filtros.</p>
              <Button variant="outline" onClick={() => alterar({ categoria: null, cor: null })}>
                Ver todos
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
