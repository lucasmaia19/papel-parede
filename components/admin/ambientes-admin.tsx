"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeOffIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { CabecalhoAdmin } from "@/components/admin/admin-shell"
import { CampoTexto, EnviarFotos, ErroCampo, Interruptor } from "@/components/admin/campos"
import { Badge } from "@/components/ui/badge"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ambienteVazio, grupoVazio, opcaoVazia, validarAmbiente, type ErrosAmbiente } from "@/lib/admin-ambientes"
import { moverItem } from "@/lib/admin-produto"
import { ambientesOrdenados, produtosQueUsam } from "@/lib/ambientes"
import { useHidratado, useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Ambiente, GrupoAmbiente } from "@/types"

function papeis(n: number) {
  return n === 1 ? "1 papel" : `${n} papéis`
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

/** Pedido de exclusão (de pergunta ou opção) que ainda precisa de confirmação, se estiver em uso */
interface Remocao {
  titulo: string
  usados: number
  confirmar: () => void
}

function EditorAmbiente({
  inicial,
  novo,
  onFechar,
}: {
  inicial: Ambiente
  novo: boolean
  onFechar: () => void
}) {
  const ambientes = useLoja((s) => s.ambientes)
  const produtos = useLoja((s) => s.produtos)
  const salvar = useLoja((s) => s.salvarAmbiente)
  const [a, setA] = useState<Ambiente>(inicial)
  const [erros, setErros] = useState<ErrosAmbiente>({})
  const [remocao, setRemocao] = useState<Remocao | null>(null)

  const atualizarGrupo = (id: string, dados: Partial<GrupoAmbiente>) =>
    setA((x) => ({ ...x, grupos: x.grupos.map((g) => (g.id === id ? { ...g, ...dados } : g)) }))

  /** Remove na hora se ninguém usa; senão, pede confirmação mostrando quantos papéis usam */
  function pedirRemocao(titulo: string, opcaoIds: string[], remover: () => void) {
    const salvo = ambientes.find((x) => x.id === a.id)
    const ids = opcaoIds.filter((id) => salvo?.grupos.some((g) => g.opcoes.some((o) => o.id === id)))
    const usados = produtos.filter((p) => ids.some((id) => produtosQueUsam([p], a.id, id) > 0)).length
    if (usados === 0) remover()
    else setRemocao({ titulo, usados, confirmar: remover })
  }

  function confirmar() {
    const { ambiente, erros: novos } = validarAmbiente(a, ambientes)
    setErros(novos)
    if (!ambiente) {
      requestAnimationFrame(() => document.querySelector("[data-slot=editor-ambiente] [data-erro]")?.scrollIntoView({ block: "center" }))
      return
    }
    salvar(ambiente)
    onFechar()
  }

  return (
    <div data-slot="editor-ambiente" className="flex flex-col gap-5">
      <CampoTexto rotulo="Nome do ambiente" valor={a.nome} onChange={(nome) => setA({ ...a, nome })} erro={erros.nome} />
      <div className="flex flex-col gap-2">
        <p className="font-medium">Imagem</p>
        <div className="flex flex-wrap items-center gap-3">
          {a.imagem ? (
            // eslint-disable-next-line @next/next/no-img-element -- SVG ou base64
            <img src={a.imagem} alt={`Imagem de ${a.nome}`} className="aspect-[4/3] w-32 rounded-sm border border-border object-cover" />
          ) : (
            <span className="flex aspect-[4/3] w-32 items-center justify-center rounded-sm border border-dashed border-input text-sm text-foreground-subtle">
              Sem imagem
            </span>
          )}
          <EnviarFotos rotulo={a.imagem ? "Trocar imagem" : "Enviar imagem"} multiplas={false} maxLado={800} onFotos={([imagem]) => setA({ ...a, imagem })} />
        </div>
      </div>
      <CampoTexto
        rotulo="Frase de destaque (opcional)"
        placeholder="Ex.: Combina com o papel adesivo lavável"
        valor={a.destaque ?? ""}
        onChange={(destaque) => setA({ ...a, destaque })}
      />
      <Interruptor
        rotulo="Ativo (aparece na loja)"
        descricao="Desligado: some do filtro, mas os papéis continuam marcados"
        marcado={a.ativo}
        onChange={(ativo) => setA({ ...a, ativo })}
      />

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-sans text-lg font-medium">Perguntas do filtro</h3>
          <p className="text-sm text-foreground-subtle">
            Opcional. Ex.: “Para qual idade?” com Bebê, Infantil… O cliente vê as perguntas ao escolher este ambiente.
          </p>
        </div>
        <ol className="flex flex-col gap-4">
          {a.grupos.map((g, i) => (
            <li key={g.id} data-slot="pergunta-admin" className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-3">
              <CampoTexto
                rotulo={`Pergunta ${i + 1}`}
                placeholder="Ex.: Para qual idade?"
                valor={g.pergunta}
                onChange={(pergunta) => atualizarGrupo(g.id, { pergunta })}
                erro={erros[`grupos.${i}.pergunta`]}
              />
              <Interruptor
                rotulo="Cliente pode marcar mais de uma"
                marcado={g.multiplo}
                onChange={(multiplo) => atualizarGrupo(g.id, { multiplo })}
              />
              <ol className="flex flex-col gap-2">
                {g.opcoes.map((o, j) => (
                  <li key={o.id} data-slot="opcao-admin" className="flex flex-col gap-2 rounded-md border border-border bg-muted/50 p-3">
                    <CampoTexto
                      rotulo={`Opção ${j + 1}`}
                      placeholder="Ex.: Infantil"
                      valor={o.nome}
                      onChange={(nome) => atualizarGrupo(g.id, { opcoes: g.opcoes.map((x) => (x.id === o.id ? { ...x, nome } : x)) })}
                      erro={erros[`grupos.${i}.opcoes.${j}.nome`]}
                    />
                    <label className="flex min-h-12 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(o.combinaComTodas)}
                        onChange={(e) =>
                          atualizarGrupo(g.id, {
                            opcoes: g.opcoes.map((x) => (x.id === o.id ? { ...x, combinaComTodas: e.target.checked || undefined } : x)),
                          })
                        }
                        className="size-6 shrink-0 cursor-pointer accent-primary"
                      />
                      <span>
                        Combina com todas as outras
                        <span className="block text-sm text-foreground-subtle">Como o “Neutro”: aparece em qualquer escolha desta pergunta</span>
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <BotoesOrdem
                        indice={j}
                        total={g.opcoes.length}
                        rotulo={`opção ${o.nome || j + 1}`}
                        onMover={(d) => atualizarGrupo(g.id, { opcoes: moverItem(g.opcoes, j, d) })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          pedirRemocao(`Excluir a opção “${o.nome}”?`, [o.id], () =>
                            setA((x) => ({
                              ...x,
                              grupos: x.grupos.map((y) => (y.id === g.id ? { ...y, opcoes: y.opcoes.filter((z) => z.id !== o.id) } : y)),
                            })),
                          )
                        }
                      >
                        <Trash2Icon aria-hidden />
                        Excluir <span className="sr-only">opção {o.nome || j + 1}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
              <ErroCampo>{erros[`grupos.${i}.opcoes`]}</ErroCampo>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => atualizarGrupo(g.id, { opcoes: [...g.opcoes, opcaoVazia()] })}>
                  <PlusIcon aria-hidden />
                  Adicionar opção <span className="sr-only">à pergunta {g.pergunta || i + 1}</span>
                </Button>
                <BotoesOrdem
                  indice={i}
                  total={a.grupos.length}
                  rotulo={`pergunta ${g.pergunta || i + 1}`}
                  onMover={(d) => setA((x) => ({ ...x, grupos: moverItem(x.grupos, i, d) }))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    pedirRemocao(
                      `Excluir a pergunta “${g.pergunta}”?`,
                      g.opcoes.map((o) => o.id),
                      () => setA((x) => ({ ...x, grupos: x.grupos.filter((y) => y.id !== g.id) })),
                    )
                  }
                >
                  <Trash2Icon aria-hidden />
                  Excluir <span className="sr-only">pergunta {g.pergunta || i + 1}</span>
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <Button variant="outline" className="sm:self-start" onClick={() => setA((x) => ({ ...x, grupos: [...x.grupos, grupoVazio()] }))}>
          <PlusIcon aria-hidden />
          Adicionar pergunta
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onFechar}>
          Cancelar
        </Button>
        <Button onClick={confirmar}>{novo ? "Cadastrar ambiente" : "Salvar ambiente"}</Button>
      </div>

      <AlertDialog open={Boolean(remocao)} onOpenChange={(aberto) => !aberto && setRemocao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{remocao?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>
              {remocao && `${papeis(remocao.usados)} ${remocao.usados === 1 ? "usa" : "usam"} esta opção.`} Ao salvar o ambiente, ela sai
              do cadastro desses papéis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                remocao?.confirmar()
                setRemocao(null)
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

export function AmbientesAdmin() {
  const hidratado = useHidratado()
  const taxonomia = useLoja((s) => s.ambientes)
  const produtos = useLoja((s) => s.produtos)
  const mover = useLoja((s) => s.moverAmbiente)
  const alternarAtivo = useLoja((s) => s.alternarAtivoAmbiente)
  const excluir = useLoja((s) => s.excluirAmbiente)
  const [editando, setEditando] = useState<{ ambiente: Ambiente; novo: boolean } | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Ambiente | null>(null)

  const ambientes = ambientesOrdenados(taxonomia)
  const usadosExcluir = paraExcluir ? produtosQueUsam(produtos, paraExcluir.id) : 0

  return (
    <div className="container-loja flex flex-col gap-6 py-8">
      <CabecalhoAdmin
        titulo="Ambientes"
        descricao="O filtro “Para qual ambiente?” da loja. A ordem aqui é a ordem na loja; ambientes sem papel não aparecem para o cliente."
        acoes={
          <Button onClick={() => setEditando({ ambiente: ambienteVazio(), novo: true })}>
            <PlusIcon aria-hidden />
            Novo ambiente
          </Button>
        }
      />

      {hidratado && ambientes.length === 0 && <p className="text-lg">Nenhum ambiente cadastrado.</p>}

      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ambientes.map((a, i) => {
          const usados = produtosQueUsam(produtos, a.id)
          return (
            <li
              key={a.id}
              data-slot="ambiente-admin"
              className={cn("flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-4", !a.ativo && "bg-muted/60")}
            >
              <div className="flex gap-4">
                {a.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element -- SVG ou base64
                  <img src={a.imagem} alt="" className={cn("aspect-[4/3] w-24 shrink-0 rounded-md border border-border object-cover", !a.ativo && "opacity-60")} />
                ) : (
                  <span className="aspect-[4/3] w-24 shrink-0 rounded-md border border-dashed border-input" />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="font-sans text-lg leading-snug">{a.nome}</h2>
                  <p className="text-sm text-foreground-subtle">{hidratado ? papeis(usados) : "–"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {!a.ativo && <Badge variant="outline">Desativado</Badge>}
                    {hidratado && usados === 0 && a.ativo && <Badge variant="secondary">Sem papel: não aparece</Badge>}
                  </div>
                </div>
              </div>
              {a.grupos.length > 0 && (
                <ul className="flex flex-col gap-1 text-sm">
                  {a.grupos.map((g) => (
                    <li key={g.id}>
                      <span className="font-medium">{g.pergunta}</span> {g.opcoes.map((o) => o.nome).join(", ")}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditando({ ambiente: structuredClone(a), novo: false })}>
                  <PencilIcon aria-hidden />
                  Editar <span className="sr-only">{a.nome}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => alternarAtivo(a.id)}>
                  {a.ativo ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  {a.ativo ? "Desativar" : "Ativar"} <span className="sr-only">{a.nome}</span>
                </Button>
                <BotoesOrdem indice={i} total={ambientes.length} rotulo={a.nome} onMover={(d) => mover(a.id, d)} />
                <Button variant="outline" size="sm" className="col-span-2 text-destructive" onClick={() => setParaExcluir(a)}>
                  <Trash2Icon aria-hidden />
                  Excluir <span className="sr-only">{a.nome}</span>
                </Button>
              </div>
            </li>
          )
        })}
      </ol>

      <Dialog open={Boolean(editando)} onOpenChange={(aberto) => !aberto && setEditando(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando?.novo ? "Novo ambiente" : `Editar: ${editando?.ambiente.nome}`}</DialogTitle>
            <DialogDescription>Nome, imagem e as perguntas que o cliente responde ao escolher este ambiente.</DialogDescription>
          </DialogHeader>
          {editando && (
            <EditorAmbiente key={editando.ambiente.id} inicial={editando.ambiente} novo={editando.novo} onFechar={() => setEditando(null)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={(aberto) => !aberto && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{paraExcluir?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {usadosExcluir > 0
                ? `${papeis(usadosExcluir)} ${usadosExcluir === 1 ? "usa" : "usam"} este ambiente. Ele sai do cadastro desses papéis e do filtro da loja.`
                : "Nenhum papel usa este ambiente."}{" "}
              Isso não pode ser desfeito. Para só esconder da loja, use “Desativar”.
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
