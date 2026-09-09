import { Logo } from '@/components/logo'
import Link from 'next/link'

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link href="/#fitur" className="hover:text-stone-900">
            Fitur
          </Link>
          <Link href="/#paket" className="hover:text-stone-900">
            Paket
          </Link>
          <Link href="/templates" className="hover:text-stone-900">
            Katalog
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-stone-900 hover:bg-stone-100"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
          >
            Daftar
          </Link>
        </nav>
      </div>
    </header>
  )
}
