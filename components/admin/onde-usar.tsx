"use client"

import { ErroCampo } from "@/components/admin/campos"
import { ambientesOrdenados, resumoAmbientes } from "@/lib/ambientes"
import { useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { AmbienteProduto } from "@/types"

const classeCaixa = "size-6 shrink-0 cursor-pointer accent-primary"

/** Admin: ambientes onde o papel aparece, com as opções de cada pergunta. */
export function OndeUsar({
  valor,
  onChange,
  erros,
}: {
  valor: AmbienteProduto[]
  onChange: (valor: AmbienteProduto[]) => void
  erros: Record<string, string>
}) {
  const taxonomia = useLoja((s) => s.ambientes)
  const ambientes = ambientesOrdenados(taxonomia)
  const resumo = resumoAmbientes({ ambientes: valor }, taxonomia, true)

  function alternarAmbiente(id: string, marcado: boolean) {
    onChange(marcado ? [...valor, { ambienteId: id, opcoes: [] }] : valor.filter((a) => a.ambienteId !== id))
  }

  function alternarOpcao(ambienteId: string, opcaoId: string, marcado: boolean) {
    onChange(
      valor.map((a) =>
        a.ambienteId === ambienteId
          ? { ...a, opcoes: marcado ? [...a.opcoes, opcaoId] : a.opcoes.filter((o) => o !== opcaoId) }
          : a,
      ),
    )
  }

  if (ambientes.length === 0) {
    return <p className="text-foreground-subtle">Nenhum ambiente cadastrado. Cadastre em Ambientes, no menu do admin.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {ambientes.map((a) => {
          const marcacao = valor.find((m) => m.ambienteId === a.id)
          return (
            <li
              key={a.id}
              data-slot="ambiente-produto"
              className={cn("flex flex-col rounded-md border bg-surface-raised", marcacao ? "border-primary" : "border-border")}
            >
              <label className="flex min-h-14 cursor-pointer items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={Boolean(marcacao)}
                  onChange={(e) => alternarAmbiente(a.id, e.target.checked)}
                  className={classeCaixa}
                />
                {a.imagem && (
                  // eslint-disable-next-line @next/next/no-img-element -- ilustração SVG ou base64
                  <img src={a.imagem} alt="" className="h-10 w-14 shrink-0 rounded-sm border border-border object-cover" />
                )}
                <span className="flex flex-col">
                  <span className="text-lg font-medium">{a.nome}</span>
                  {!a.ativo && <span className="text-sm text-foreground-subtle">Desativado na loja</span>}
                </span>
              </label>
              {marcacao && a.grupos.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-border p-3 pt-4">
                  {a.grupos.map((g) => (
                    <fieldset key={g.id} className="flex flex-col gap-2">
                      <legend className="mb-1 font-medium">{g.pergunta}</legend>
                      <div className="flex flex-wrap gap-2">
                        {g.opcoes.map((o) => (
                          <label
                            key={o.id}
                            className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-input bg-background px-4 has-checked:border-primary has-checked:bg-primary-soft"
                          >
                            <input
                              type="checkbox"
                              checked={marcacao.opcoes.includes(o.id)}
                              onChange={(e) => alternarOpcao(a.id, o.id, e.target.checked)}
                              className="size-5 shrink-0 cursor-pointer accent-primary"
                            />
                            {o.nome}
                          </label>
                        ))}
                      </div>
                      <ErroCampo>{erros[`ambientes.${a.id}.${g.id}`]}</ErroCampo>
                    </fieldset>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <ErroCampo>{erros.ambientes}</ErroCampo>
      <p data-slot="resumo-ambientes" aria-live="polite" className="rounded-md bg-muted p-4">
        {resumo ? (
          <>
            <span className="font-medium">Este papel aparece em:</span> {resumo}
          </>
        ) : (
          "Ainda não aparece em nenhum ambiente."
        )}
      </p>
    </div>
  )
}
