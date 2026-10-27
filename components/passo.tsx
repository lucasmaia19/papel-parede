import type { ComponentProps, ReactNode } from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PassoProps extends Omit<ComponentProps<"section">, "title"> {
  numero: number
  titulo: ReactNode
  /** Passo já resolvido: o número vira ✓ */
  concluido?: boolean
  /** Próximo passo a fazer: mostra "Você está aqui" */
  atual?: boolean
  descricao?: ReactNode
}

/** Seção numerada de um fluxo guiado ("1. Escolha a cor", "2. Medidas"…). */
export function Passo({ numero, titulo, concluido, atual, descricao, className, children, ...props }: PassoProps) {
  const idTitulo = `passo-${numero}-titulo`
  return (
    <section
      data-slot="passo"
      aria-labelledby={idTitulo}
      className={cn("flex scroll-mt-24 flex-col gap-4 border-t border-border pt-6", className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-heading text-lg font-medium",
            concluido
              ? "border-primary bg-primary text-primary-foreground"
              : atual
                ? "border-primary text-primary"
                : "border-foreground/70 text-foreground",
          )}
        >
          {concluido ? <CheckIcon className="size-5" /> : numero}
        </span>
        <div className="flex flex-col gap-1">
          <h2 id={idTitulo} className="text-xl leading-tight md:text-2xl">
            <span className="sr-only">
              Passo {numero}
              {concluido ? " (concluído)" : ""}:{" "}
            </span>
            {titulo}
          </h2>
          {atual && (
            <p className="w-fit rounded-sm bg-primary-soft px-2 py-0.5 text-sm font-medium text-primary-hover">Você está aqui</p>
          )}
          {descricao && <div className="text-foreground-subtle">{descricao}</div>}
        </div>
      </div>
      {children}
    </section>
  )
}
