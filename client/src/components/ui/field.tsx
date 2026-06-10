import * as React from "react"
import { cn } from "@/lib/utils"

export const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex rounded-lg border border-input p-4 hover:bg-accent/50 cursor-pointer transition-colors",
        orientation === "horizontal" ? "flex-row items-center justify-between gap-4" : "flex-col gap-2",
        className
      )}
      {...props}
    />
  )
)
Field.displayName = "Field"

export const FieldContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
  )
)
FieldContent.displayName = "FieldContent"

export const FieldTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4 ref={ref} className={cn("text-sm font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
FieldTitle.displayName = "FieldTitle"

export const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("cursor-pointer", className)} {...props} />
  )
)
FieldLabel.displayName = "FieldLabel"

export const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
FieldDescription.displayName = "FieldDescription"
