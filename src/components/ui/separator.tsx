import { cn } from "cn"

/**
 * Static rule, not the Radix primitive: `RadixSeparator` is a client component
 * and pulls the whole Radix runtime into the browser bundle for a div with a
 * one-pixel background. `role="none"` keeps it out of the accessibility tree,
 * which is what `decorative` did.
 */
function Separator({
  orientation = "horizontal",
  className,
  ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      data-slot="separator"
      role="none"
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
