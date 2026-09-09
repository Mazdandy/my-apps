import { db } from '@/lib/db'
import { LandingNav } from '@/components/landing-nav'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Katalog Tema - FAAS' }

export default async function TemplatesPage() {
  const templates = await db.template.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <main className="min-h-screen bg-stone-50">
      <LandingNav />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold text-stone-900">Katalog Tema Undangan</h1>
        <p className="mt-2 text-stone-500">
          Pilih tema untuk undangan pernikahan, ulang tahun, dan acara lainnya.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md">
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100">
                <span className="font-serif text-3xl text-rose-700">{t.name}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900">{t.name}</h2>
                  <span className="text-sm font-medium text-stone-500">
                    {t.free ? 'Gratis' : formatRupiah(t.price)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-500">{t.description}</p>
                <Link
                  href={`/templates/${t.slug}`}
                  className="mt-4 inline-block w-full rounded-full border border-rose-300 py-2 text-center text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
