"use client"

import { useId, useRef, useState, type ComponentProps, type ReactNode } from "react"
import { ImagePlusIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { comprimirImagem, lerArquivo } from "@/lib/imagem"
import { cn } from "@/lib/utils"

export function ErroCampo({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} data-erro className="font-medium text-destructive">
      {children}
    </p>
  )
}

interface CampoTextoProps extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  rotulo: ReactNode
  valor: string
  onChange: (valor: string) => void
  erro?: string
  ajuda?: ReactNode
  sufixo?: string
}

export function CampoTexto({ rotulo, valor, onChange, erro, ajuda, sufixo, className, ...props }: CampoTextoProps) {
  const id = useId()
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      {ajuda && <p className="text-sm text-foreground-subtle">{ajuda}</p>}
      <div className="relative">
        <Input
          id={id}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={sufixo ? "pr-16" : undefined}
          {...props}
        />
        {sufixo && (
          <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-foreground-subtle">
            {sufixo}
          </span>
        )}
      </div>
      <ErroCampo id={`${id}-erro`}>{erro}</ErroCampo>
    </div>
  )
}

interface CampoAreaProps extends Omit<ComponentProps<"textarea">, "onChange" | "value"> {
  rotulo: ReactNode
  valor: string
  onChange: (valor: string) => void
  erro?: string
}

export function CampoArea({ rotulo, valor, onChange, erro, className, ...props }: CampoAreaProps) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      <Textarea
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...props}
      />
      <ErroCampo id={`${id}-erro`}>{erro}</ErroCampo>
    </div>
  )
}

export function Interruptor({
  rotulo,
  descricao,
  marcado,
  onChange,
}: {
  rotulo: string
  descricao?: string
  marcado: boolean
  onChange: (v: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 rounded-md border border-border bg-surface-raised p-3 pl-4">
      <div className="flex flex-col">
        <label htmlFor={id} className="font-medium">
          {rotulo}
        </label>
        {descricao && <span className="text-sm text-foreground-subtle">{descricao}</span>}
      </div>
      <Switch id={id} checked={marcado} onCheckedChange={onChange} />
    </div>
  )
}

export const classeSelect =
  "h-14 w-full rounded-md border border-input bg-surface-raised px-4 text-lg text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

export function CampoSelect({
  rotulo,
  valor,
  onChange,
  children,
  className,
}: {
  rotulo: string
  valor: string
  onChange: (v: string) => void
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} className={classeSelect}>
        {children}
      </select>
    </div>
  )
}

/** Seção do formulário do admin, com título e linha fina. */
export function SecaoAdmin({
  titulo,
  descricao,
  children,
  id,
  className,
}: {
  titulo: string
  descricao?: ReactNode
  children: ReactNode
  id?: string
  className?: string
}) {
  return (
    <section id={id} aria-label={titulo} className={cn("flex scroll-mt-28 flex-col gap-4 border-t border-border pt-6", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-2xl">{titulo}</h2>
        {descricao && <p className="text-foreground-subtle">{descricao}</p>}
      </div>
      {children}
    </section>
  )
}

/**
 * Botão de envio de fotos: redimensiona e guarda em base64 (sem servidor).
 * maxLado menor = menos espaço no navegador.
 */
export function EnviarFotos({
  rotulo = "Enviar fotos",
  multiplas = true,
  maxLado = 1200,
  onFotos,
  variant = "outline",
  className,
}: {
  rotulo?: string
  multiplas?: boolean
  maxLado?: number
  onFotos: (dataUrls: string[]) => void
  variant?: "outline" | "default" | "secondary"
  className?: string
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function processar(arquivos: FileList | null) {
    if (!arquivos?.length) return
    setEnviando(true)
    setErro(null)
    try {
      const lista: string[] = []
      for (const arquivo of Array.from(arquivos)) {
        if (!arquivo.type.startsWith("image/")) continue
        lista.push(await comprimirImagem(await lerArquivo(arquivo), { maxLado, qualidade: 0.8 }))
      }
      if (lista.length === 0) setErro("Escolha arquivos de imagem (JPG, PNG ou WEBP).")
      else onFotos(lista)
    } catch {
      setErro("Não foi possível abrir uma das fotos.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        multiple={multiplas}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-slot="entrada-fotos"
        onChange={(e) => {
          void processar(e.target.files)
          e.target.value = ""
        }}
      />
      <Button variant={variant} onClick={() => entrada.current?.click()} disabled={enviando}>
        {enviando ? <LoaderCircleIcon className="animate-spin" aria-hidden /> : <ImagePlusIcon aria-hidden />}
        {enviando ? "Preparando…" : rotulo}
      </Button>
      <ErroCampo>{erro}</ErroCampo>
    </div>
  )
}
