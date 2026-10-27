"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { CabecalhoAdmin } from "@/components/admin/admin-shell"
import { CampoSelect, CampoTexto, EnviarFotos, ErroCampo, Interruptor } from "@/components/admin/campos"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { gerarIdSimples } from "@/lib/id"
import { useHidratado, useLoja } from "@/lib/store"
import type { WorkGallery } from "@/types"

type Erros = Partial<Record<"titulo" | "cidade" | "fotoAntes" | "fotoDepois", string>>

function validar(t: WorkGallery): Erros {
  const e: Erros = {}
  if (!t.titulo.trim()) e.titulo = "Digite um título. Exemplo: Sala de estar com listras."
  if (!t.cidade.trim()) e.cidade = "Digite a cidade."
  if (!t.fotoDepois) e.fotoDepois = "Envie a foto de depois."
  return e
}

function FotoCampo({ rotulo, valor, onChange, erro }: { rotulo: string; valor: string; onChange: (url: string) => void; erro?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium">{rotulo}</p>
      <div className="flex items-center gap-3">
        {valor ? (
          // eslint-disable-next-line @next/next/no-img-element -- base64 ou /public
          <img src={valor} alt={rotulo} className="aspect-[16/11] w-32 rounded-sm border border-border object-cover" />
        ) : (
          <span className="flex aspect-[16/11] w-32 items-center justify-center rounded-sm border border-dashed border-input text-sm text-foreground-subtle">
            Sem foto
          </span>
        )}
        <EnviarFotos rotulo={valor ? "Trocar" : "Enviar"} multiplas={false} maxLado={1400} onFotos={([url]) => onChange(url)} />
      </div>
      <ErroCampo>{erro}</ErroCampo>
    </div>
  )
}

export function TrabalhosAdmin() {
  const hidratado = useHidratado()
  const trabalhos = useLoja((s) => s.trabalhos)
  const produtos = useLoja((s) => s.produtos)
  const salvar = useLoja((s) => s.salvarTrabalho)
  const excluir = useLoja((s) => s.excluirTrabalho)
  const mover = useLoja((s) => s.moverTrabalho)
  const [editando, setEditando] = useState<WorkGallery | null>(null)
  const [erros, setErros] = useState<Erros>({})
  const [paraExcluir, setParaExcluir] = useState<WorkGallery | null>(null)

  function abrir(t?: WorkGallery) {
    setErros({})
    setEditando(t ? { ...t } : { id: gerarIdSimples("t"), titulo: "", cidade: "Uberlândia", fotoAntes: "", fotoDepois: "", destaque: false })
  }

  function confirmar() {
    if (!editando) return
    const e = validar(editando)
    setErros(e)
    if (Object.keys(e).length) return
    salvar({ ...editando, titulo: editando.titulo.trim(), cidade: editando.cidade.trim() })
    setEditando(null)
  }

  return (
    <div className="container-loja flex flex-col gap-6 py-8">
      <CabecalhoAdmin
        titulo="Trabalhos realizados"
        descricao="A ordem aqui é a ordem na loja (os destaques aparecem primeiro e na página inicial)."
        acoes={
          <Button onClick={() => abrir()}>
            <PlusIcon aria-hidden />
            Novo trabalho
          </Button>
        }
      />

      {hidratado && trabalhos.length === 0 && <p className="text-lg">Nenhum trabalho cadastrado.</p>}

      <ol className="grid gap-4 md:grid-cols-2">
        {trabalhos.map((t, i) => (
          <li key={t.id} data-slot="trabalho-admin" className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { src: t.fotoAntes, rotulo: "Antes" },
                { src: t.fotoDepois, rotulo: "Depois" },
              ]
                .filter((f) => f.src)
                .map((f) => (
                <figure key={f.rotulo} className="flex flex-col gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element -- base64 ou /public */}
                  <img src={f.src} alt={`${f.rotulo}: ${t.titulo}`} className="aspect-[16/11] w-full rounded-sm border border-border object-cover" />
                  <figcaption className="text-sm text-foreground-subtle">{f.rotulo}</figcaption>
                </figure>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-sans text-lg">{t.titulo}</h2>
              {t.destaque && <Badge variant="soft">Destaque</Badge>}
            </div>
            <p className="text-foreground-subtle">
              {t.cidade}
              {t.produtoId && ` · ${produtos.find((p) => p.id === t.produtoId)?.nome ?? "papel removido"}`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => abrir(t)}>
                <PencilIcon aria-hidden />
                Editar <span className="sr-only">{t.titulo}</span>
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setParaExcluir(t)}>
                <Trash2Icon aria-hidden />
                Excluir <span className="sr-only">{t.titulo}</span>
              </Button>
              <Button variant="outline" size="sm" disabled={i === 0} onClick={() => mover(t.id, -1)}>
                <ArrowUpIcon aria-hidden />
                Subir <span className="sr-only">{t.titulo}</span>
              </Button>
              <Button variant="outline" size="sm" disabled={i === trabalhos.length - 1} onClick={() => mover(t.id, 1)}>
                <ArrowDownIcon aria-hidden />
                Descer <span className="sr-only">{t.titulo}</span>
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <Dialog open={Boolean(editando)} onOpenChange={(aberto) => !aberto && setEditando(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editando && trabalhos.some((t) => t.id === editando.id) ? "Editar trabalho" : "Novo trabalho"}</DialogTitle>
          </DialogHeader>
          {editando && (
            <div className="flex flex-col gap-4">
              <CampoTexto rotulo="Título" valor={editando.titulo} onChange={(titulo) => setEditando({ ...editando, titulo })} erro={erros.titulo} />
              <CampoTexto rotulo="Cidade" valor={editando.cidade} onChange={(cidade) => setEditando({ ...editando, cidade })} erro={erros.cidade} />
              <FotoCampo rotulo="Foto de antes (opcional)" valor={editando.fotoAntes} onChange={(fotoAntes) => setEditando({ ...editando, fotoAntes })} erro={erros.fotoAntes} />
              <FotoCampo rotulo="Foto de depois" valor={editando.fotoDepois} onChange={(fotoDepois) => setEditando({ ...editando, fotoDepois })} erro={erros.fotoDepois} />
              <CampoSelect
                rotulo="Papel de parede usado (opcional)"
                valor={editando.produtoId ?? ""}
                onChange={(v) => setEditando({ ...editando, produtoId: v || undefined })}
              >
                <option value="">Nenhum</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </CampoSelect>
              <Interruptor
                rotulo="Destaque"
                descricao="Aparece primeiro e na página inicial"
                marcado={editando.destaque}
                onChange={(destaque) => setEditando({ ...editando, destaque })}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setEditando(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmar}>Salvar trabalho</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={(aberto) => !aberto && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{paraExcluir?.titulo}”?</AlertDialogTitle>
            <AlertDialogDescription>As fotos saem da loja. Isso não pode ser desfeito.</AlertDialogDescription>
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
