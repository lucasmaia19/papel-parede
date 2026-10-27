"use client"

import { ArrowDownIcon, ArrowUpIcon, StarIcon, Trash2Icon } from "lucide-react"
import { EnviarFotos, ErroCampo } from "@/components/admin/campos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { moverItem } from "@/lib/admin-produto"
import { gerarIdSimples } from "@/lib/id"
import type { ImagemProduto } from "@/types"

interface FotosProdutoProps {
  nomeProduto: string
  imagens: ImagemProduto[]
  onChange: (imagens: ImagemProduto[]) => void
  erro?: string
}

/** Fotos ordenadas; a primeira é a principal (aparece no card e recebe a régua). */
export function FotosProduto({ nomeProduto, imagens, onChange, erro }: FotosProdutoProps) {
  return (
    <div className="flex flex-col gap-4">
      {imagens.length > 0 && (
        <ol className="grid gap-3 sm:grid-cols-2">
          {imagens.map((img, i) => (
            <li key={img.id} data-slot="foto-produto" className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- base64 ou /public */}
                <img src={img.url} alt={img.alt} className="size-20 shrink-0 rounded-sm border border-border object-cover" />
                <span className="font-medium">Foto {i + 1}</span>
                {i === 0 && <Badge variant="soft">Principal</Badge>}
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" disabled={i === 0} onClick={() => onChange(moverItem(imagens, i, -1))}>
                    <ArrowUpIcon aria-hidden />
                    Subir <span className="sr-only">foto {i + 1}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={i === imagens.length - 1}
                    onClick={() => onChange(moverItem(imagens, i, 1))}
                  >
                    <ArrowDownIcon aria-hidden />
                    Descer <span className="sr-only">foto {i + 1}</span>
                  </Button>
                  {i > 0 && (
                    <Button variant="outline" size="sm" onClick={() => onChange([img, ...imagens.filter((x) => x.id !== img.id)])}>
                      <StarIcon aria-hidden />
                      Principal <span className="sr-only">: foto {i + 1}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => onChange(imagens.filter((x) => x.id !== img.id))}
                  >
                    <Trash2Icon aria-hidden />
                    Remover <span className="sr-only">foto {i + 1}</span>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <EnviarFotos
        rotulo={imagens.length ? "Enviar mais fotos" : "Enviar fotos"}
        onFotos={(urls) =>
          onChange([
            ...imagens,
            ...urls.map((url, j) => ({
              id: gerarIdSimples("i"),
              url,
              alt: `${nomeProduto || "Papel de parede"} — foto ${imagens.length + j + 1}`,
            })),
          ])
        }
        className="sm:self-start"
      />
      <ErroCampo>{erro}</ErroCampo>
    </div>
  )
}
