"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toast Adora: permukaan kartu, garis hairline, radius popover. Warna dari token
 * (bukan slate/white), jadi sama persis di light & dark. Ikon status diberi warna semantik.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4 text-violet-ink" />,
        info: <Info className="size-4 text-muted" />,
        warning: <TriangleAlert className="size-4 text-magenta-pulse" />,
        error: <OctagonX className="size-4 text-danger" />,
        loading: <LoaderCircle className="size-4 animate-spin text-muted" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface-elevated-card)",
          "--normal-text": "var(--text-body)",
          "--normal-border": "var(--border-hairline)",
          "--border-radius": "var(--radius-popover)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans group-[.toaster]:border group-[.toaster]:border-hairline group-[.toaster]:bg-card group-[.toaster]:text-ink-soft group-[.toaster]:shadow-adora group-[.toaster]:rounded-popover",
          title: "group-[.toast]:font-semibold group-[.toast]:text-ink",
          description: "group-[.toast]:text-muted",
          actionButton:
            "group-[.toast]:bg-action group-[.toast]:text-on-accent group-[.toast]:rounded-control",
          cancelButton:
            "group-[.toast]:bg-recessed group-[.toast]:text-ink-soft group-[.toast]:rounded-control",
          closeButton:
            "group-[.toast]:border-hairline group-[.toast]:bg-card group-[.toast]:text-muted",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
