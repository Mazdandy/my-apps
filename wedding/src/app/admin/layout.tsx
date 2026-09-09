import Link from 'next/link'
import { Logo } from '@/components/logo'
import { logout } from '@/lib/actions/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="flex w-60 flex-col border-r border-stone-200 bg-stone-900">
        <div className="flex h-16 items-center border-b border-stone-800 px-6">
          <Logo dark />
        </div>
        <nav className="flex-1 space-y-1 p-4 text-sm font-medium text-stone-400">
          <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-stone-800 hover:text-white">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block rounded-lg px-3 py-2 hover:bg-stone-800 hover:text-white">
            Pengguna
          </Link>
          <Link href="/admin/templates" className="block rounded-lg px-3 py-2 hover:bg-stone-800 hover:text-white">
            Tema
          </Link>
          <Link href="/admin/plans" className="block rounded-lg px-3 py-2 hover:bg-stone-800 hover:text-white">
            Paket
          </Link>
          <Link href="/admin/payments" className="block rounded-lg px-3 py-2 hover:bg-stone-800 hover:text-white">
            Pembayaran
          </Link>
        </nav>
        <div className="border-t border-stone-800 p-4">
          <form action={logout}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white">
              Keluar
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-8">
          <h1 className="text-lg font-semibold text-stone-900">Admin Console</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
