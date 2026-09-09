'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'

type Nav = { href: string; label: string; desc: string; icon: string }

const PRIMARY: Nav[] = [
  {
    href: '/',
    label: 'Dashboard',
    desc: 'Ringkasan & sesi',
    icon: 'space_dashboard',
  },
  {
    href: '/brainstorm',
    label: 'Brainstorm QA Docs',
    desc: 'Strategy · Plan · Test Case',
    icon: 'auto_awesome',
  },
  {
    href: '/testcases',
    label: 'Test Case Management',
    desc: 'Kelola per sesi',
    icon: 'fact_check',
  },
]

const COMING_SOON: { label: string; desc: string; icon: string }[] = [
  { label: 'Test Execution', desc: 'Jalankan & catat hasil', icon: 'playlist_play' },
  { label: 'Test Report', desc: 'Laporan hasil testing', icon: 'assessment' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-surface-container-high bg-surface-dim md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary shadow-md">
            <Icon name="verified" className="text-lg" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-tight text-on-surface">
              QA-Helper
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-outline">
              Alat bantu QA
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-2.5 py-2">
          <div className="space-y-1">
            {PRIMARY.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-start gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`mt-0.5 text-lg ${active ? 'text-on-primary-container' : 'text-primary'}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={`block truncate text-[11px] ${
                        active ? 'text-on-primary-container/70' : 'text-outline'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>

          <div>
            <div className="px-3 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-outline">
              Segera hadir
            </div>
            <div className="space-y-1">
              {COMING_SOON.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2.5 rounded-lg px-3 py-2 opacity-60"
                  title="Menu belum tersedia di MVP"
                >
                  <Icon name={item.icon} className="mt-0.5 text-lg text-outline" />
                  <span className="min-w-0">
                    <span className="block text-sm leading-tight text-outline">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-outline">
                      {item.desc}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-surface-container-high px-4 py-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-outline">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            MVP v0.2 · SQLite lokal
          </div>
        </div>
      </aside>

      {/* ===== Konten ===== */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-surface-container-high bg-surface/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-on-primary">
              <Icon name="verified" className="text-sm" />
            </div>
            <span className="font-display text-sm font-semibold">QA-Helper</span>
          </div>
          <nav className="flex gap-1 text-xs">
            {PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 ${
                  isActive(item.href)
                    ? 'bg-primary-container font-medium text-on-primary-container'
                    : 'text-on-surface-variant'
                }`}
              >
                <Icon name={item.icon} className="text-sm" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
