"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { CopyIcon, EyeIcon, EyeOffIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { CabecalhoAdmin } from "@/components/admin/admin-shell"
import { CampoSelect } from "@/components/admin/campos"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { ambientesOrdenados, indicacoesProduto } from "@/lib/ambientes"
import { ROTULO_CATEGORIA } from "@/lib/data"
import { filtrarProdutos, imagemPrincipal } from "@/lib/catalogo"
import { materiaisAtivos, precoAPartirDe } from "@/lib/materiais"
import { formatarMoeda } from "@/lib/pricing"
import { useHidratado, useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

export function ProdutosLista() {
  const router = useRouter()
  const idBusca = useId()
  const hidratado = useHidratado()
  const produtos = useLoja((s) => s.produtos)
  const duplicar = useLoja((s) => s.duplicarProduto)
  const alternarAtivo = useLoja((s) => s.alternarAtivoProduto)
  const excluir = useLoja((s) => s.excluirProduto)
  const taxonomia = useLoja((s) => s.ambientes)
  const [busca, setBusca] = useState("")
  /** "" = todos, "sem" = sem ambiente, ou o id do ambiente */
  const [ambienteFiltro, setAmbienteFiltro] = useState("")
  const [paraExcluir, setParaExcluir] = useState<Product | null>(null)

  const ambientesDe = (p: Product) => indicacoesProduto(p, taxonomia, true).map((i) => i.ambiente)
  const semAmbiente = produtos.filter((p) => ambientesDe(p).length === 0).length
  const lista = filtrarProdutos(produtos, { busca }).filter((p) => {
    if (!ambienteFiltro) return true
    const ids = ambientesDe(p).map((a) => a.id)
    return ambienteFiltro === "sem" ? ids.length === 0 : ids.includes(ambienteFiltro)
  })

  return (
    <div className="container-loja flex flex-col gap-6 py-8">
      <CabecalhoAdmin
        titulo="Papéis de parede"
        descricao={hidratado ? `${produtos.length} cadastrados, ${produtos.filter((p) => p.ativo).length} à venda.` : undefined}
        acoes={
          <Link href="/admin/produtos/novo" className={buttonVariants()}>
            <PlusIcon aria-hidden />
            Novo papel de parede
          </Link>
        }
      />

      {hidratado && semAmbiente > 0 && (
        <p role="note" className="rounded-md border border-warning-border bg-warning-bg p-4">
          <strong className="font-medium">
            {semAmbiente === 1 ? "1 papel está sem ambiente" : `${semAmbiente} papéis estão sem ambiente`}
          </strong>{" "}
          e não aparece{semAmbiente === 1 ? "" : "m"} no filtro “Para qual ambiente?”.{" "}
          <button type="button" className="min-h-12 font-medium underline underline-offset-4" onClick={() => setAmbienteFiltro("sem")}>
            Ver quais
          </button>
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_18rem] md:items-end">
      <div className="relative">
        <label htmlFor={idBusca} className="sr-only">
          Buscar papel de parede
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-foreground-subtle" aria-hidden />
        <Input
          id={idBusca}
          type="search"
          placeholder="Buscar pelo nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-12"
        />
      </div>
      <CampoSelect rotulo="Ambiente" valor={ambienteFiltro} onChange={setAmbienteFiltro}>
        <option value="">Todos os ambientes</option>
        <option value="sem">Sem ambiente</option>
        {ambientesOrdenados(taxonomia).map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </CampoSelect>
      </div>

      {hidratado && lista.length === 0 && <p className="text-lg">Nenhum papel encontrado.</p>}

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((p) => (
          <li key={p.id}>
            <article
              data-slot="produto-admin"
              className={cn("flex h-full flex-col gap-4 rounded-md border border-border bg-surface-raised p-4", !p.ativo && "bg-muted/60")}
            >
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- pode ser base64 */}
                <img src={imagemPrincipal(p)} alt="" className={cn("size-24 shrink-0 rounded-md border border-border object-cover", !p.ativo && "opacity-60")} />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h2 className="font-sans text-lg leading-snug">{p.nome}</h2>
                  <p>
                    <strong className="font-medium">{formatarMoeda(precoAPartirDe(p))}</strong>/m² · {ROTULO_CATEGORIA[p.categoria]}
                  </p>
                  <p className="text-sm text-foreground-subtle">
                    {materiaisAtivos(p).map((m) => m.nome).join(" · ") || "Nenhum material ativo"}
                  </p>
                  {ambientesDe(p).length > 0 && (
                    <p data-slot="ambientes-admin" className="text-sm">
                      <span className="font-medium">Ambientes:</span> {ambientesDe(p).map((a) => a.nome).join(" · ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {ambientesDe(p).length === 0 && <Badge variant="destructive">Sem ambiente</Badge>}
                    {p.prontaEntrega && <Badge variant="soft">Pronta entrega</Badge>}
                    {!p.ativo && <Badge variant="outline">Desativado</Badge>}
                    {p.iaHabilitada && <Badge variant="secondary">IA</Badge>}
                  </div>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Link href={`/admin/produtos/${p.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <PencilIcon aria-hidden />
                  Editar <span className="sr-only">{p.nome}</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copia = duplicar(p.id)
                    if (copia) router.push(`/admin/produtos/${copia.id}`)
                  }}
                >
                  <CopyIcon aria-hidden />
                  Duplicar <span className="sr-only">{p.nome}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => alternarAtivo(p.id)}>
                  {p.ativo ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  {p.ativo ? "Desativar" : "Ativar"} <span className="sr-only">{p.nome}</span>
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setParaExcluir(p)}>
                  <Trash2Icon aria-hidden />
                  Excluir <span className="sr-only">{p.nome}</span>
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={(aberto) => !aberto && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{paraExcluir?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Ele sai da loja e do admin. Isso não pode ser desfeito. Se quiser só tirar da loja por um tempo, use
              “Desativar”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (paraExcluir) excluir(paraExcluir.id)
                setParaExcluir(null)
              }}
            >
              Sim, excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
