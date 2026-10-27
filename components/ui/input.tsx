import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-md border border-input bg-surface-raised px-4 text-lg text-foreground transition-colors outline-none",
        "placeholder:text-foreground-subtle/70",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "file:mr-3 file:inline-flex file:h-10 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
