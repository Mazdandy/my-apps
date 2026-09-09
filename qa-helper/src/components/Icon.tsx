// Material Symbols Outlined — nama ikon: https://fonts.google.com/icons
// Ukuran via className text-* ; FILL varian via prop fill.
export default function Icon({
  name,
  className = "text-base",
  fill = false,
}: {
  name: string
  className?: string
  fill?: boolean
}) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined leading-none ${className}`}
      style={{ fontVariationSettings: `"FILL" ${fill ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24` }}
    >
      {name}
    </span>
  )
}
