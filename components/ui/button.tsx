import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Botões sólidos, retangulares e grandes (mínimo 48px de altura).
 * Nada de botão fantasma de baixo contraste: "outline" tem borda escura e fundo branco.
 */
const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center rounded-md border text-center font-semibold leading-tight transition-colors outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50",
    "aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  ],
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover",
        outline:
          "border-foreground/80 bg-surface-raised text-foreground hover:bg-accent aria-expanded:bg-accent",
        secondary: "border-border bg-muted text-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-accent aria-expanded:bg-accent",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40",
        whatsapp: "border-whatsapp bg-whatsapp text-white hover:border-whatsapp-hover hover:bg-whatsapp-hover",
        link: "h-auto min-h-0 border-transparent px-0 text-foreground underline underline-offset-4 hover:text-primary",
      },
      size: {
        default: "min-h-12 gap-2 px-5 py-2 text-base",
        sm: "min-h-12 gap-2 px-4 py-2 text-sm",
        lg: "min-h-14 gap-2.5 px-6 py-3 text-lg",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
