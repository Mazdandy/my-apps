import Link from 'next/link'
import { Logo } from '@/components/logo'
import { logout } from '@/lib/actions/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-stone-200 bg-white">
        <div className="flex h-16 items-center border-b border-stone-200 px-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-4 text-sm font-medium text-stone-600">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 hover:bg-stone-100 hover:text-stone-900">
            Ringkasan
          </Link>
          <Link href="/dashboard/invitations" className="block rounded-lg px-3 py-2 hover:bg-stone-100 hover:text-stone-900">
            Undanganku
          </Link>
          <Link href="/dashboard/subscription" className="block rounded-lg px-3 py-2 hover:bg-stone-100 hover:text-stone-900">
            Langganan
          </Link>
        </nav>
        <div className="border-t border-stone-200 p-4">
          <form action={logout}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-8">
          <h1 className="text-lg font-semibold text-stone-900">Dashboard</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
