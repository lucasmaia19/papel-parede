"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-input bg-muted transition-colors outline-none",
        "after:absolute after:-inset-2 focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none ml-0.5 block size-6 rounded-full border border-input bg-surface-raised transition-transform data-checked:translate-x-6 data-checked:border-surface-raised"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
