"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

/**
 * O Radix emite `data-state="checked" | "unchecked"`, entao os seletores sao
 * `data-[state=checked]:`. A versao anterior usava `data-checked:`, que nunca
 * casava — por isso o switch nao mudava de cor nem movia a bolinha.
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // ligado: verde da marca · desligado: cinza com contraste visivel
        "data-[state=checked]:bg-primary",
        "data-[state=unchecked]:bg-texto-fraco/50",
        size === "default" ? "h-6 w-11" : "h-5 w-9",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-md ring-0",
          "transition-transform duration-200",
          size === "default"
            ? "size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            : "size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
