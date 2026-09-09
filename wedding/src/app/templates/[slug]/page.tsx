import { db } from '@/lib/db'
import { LandingNav } from '@/components/landing-nav'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const template = await db.template.findUnique({ where: { slug } })

  if (!template) notFound()

  const sections = [
    'Cover & Nama Tamu Personal',
    'Countdown Timer',
    'Musik / Backsound',
    'Kutipan & Quotes',
    'Profil Mempelai',
    'Detail Acara + Google Maps',
    'Formulir RSVP',
    'Formulir Ucapan',
    'Gallery Foto & Video',
    'Rekening Hadiah',
    'Live Streaming',
    'Our Story',
  ]

  return (
    <main className="min-h-screen bg-white">
      <LandingNav />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex h-[26rem] items-center justify-center rounded-3xl bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100">
              <span className="font-serif text-5xl text-rose-700">{template.name}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-rose-500">
              {template.category}
            </p>
            <h1 className="mt-2 text-4xl font-bold text-stone-900">{template.name}</h1>
            <p className="mt-3 text-stone-600">{template.description}</p>
            <div className="mt-6">
              <span className="text-3xl font-bold text-stone-900">
                {template.free ? 'Gratis' : formatRupiah(template.price)}
              </span>
              {!template.free && <span className="text-stone-500"> / sekali pakai</span>}
            </div>
            <div className="mt-8 flex gap-4">
              <Link
                href="/register"
                className="rounded-full bg-rose-500 px-8 py-3 font-semibold text-white hover:bg-rose-600"
              >
                Pilih Tema Ini
              </Link>
              <Link
                href="/templates"
                className="rounded-full border border-stone-300 px-8 py-3 font-semibold text-stone-700 hover:bg-stone-50"
              >
                Kembali
              </Link>
            </div>
            <h2 className="mt-10 text-lg font-semibold text-stone-900">Fitur yang termasuk</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {sections.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">
                    ✓
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
