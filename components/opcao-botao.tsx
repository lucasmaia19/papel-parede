import type { ComponentProps } from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface OpcaoBotaoProps extends ComponentProps<"button"> {
  ativo: boolean
}

/** Botão grande de escolha (liga/desliga), com ✓ quando escolhido. */
export function OpcaoBotao({ ativo, className, children, ...props }: OpcaoBotaoProps) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      data-slot="opcao-botao"
      data-ativo={ativo ? "" : undefined}
      className={cn(
        "inline-flex min-h-12 items-center gap-2.5 rounded-md border px-3.5 py-2 text-left text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        ativo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-surface-raised text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
      {ativo && <CheckIcon className="ml-auto size-5 shrink-0" aria-hidden />}
    </button>
  )
}
