import Link from 'next/link'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`font-bold text-xl tracking-tight ${dark ? 'text-white' : 'text-stone-900'}`}>
      FAAS<span className="text-rose-500">.</span>
    </Link>
  )
}
