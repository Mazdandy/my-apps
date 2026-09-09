type Tone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "neutral"
  | "outline"
  | "highest"

const STYLES: Record<Tone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container/25 text-secondary",
  tertiary: "bg-tertiary-container/30 text-tertiary",
  error: "bg-error/15 text-error",
  neutral: "bg-surface-container-high text-on-surface-variant",
  outline: "bg-surface-container text-outline",
  highest: "bg-surface-container-highest text-on-surface-variant",
}

// Pemetaan warna legacy (Tailwind zinc/indigo/dst) agar call-site lama tetap jalan
const LEGACY: Record<string, Tone> = {
  zinc: "neutral",
  indigo: "primary",
  green: "secondary",
  amber: "tertiary",
  red: "error",
  sky: "primary",
  rose: "error",
}

export default function Badge({
  children,
  tone,
  color,
  className = "",
}: {
  children: React.ReactNode
  tone?: Tone
  color?: string // legacy: zinc|indigo|green|amber|red|sky|rose
  className?: string
}) {
  const t = tone ?? (color ? (LEGACY[color] ?? "neutral") : "neutral")
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none ${STYLES[t]} ${className}`}
    >
      {children}
    </span>
  )
}
