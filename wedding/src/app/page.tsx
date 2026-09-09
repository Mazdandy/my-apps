import { db } from '@/lib/db'
import { LandingNav } from '@/components/landing-nav'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const features = [
  { title: 'Tamu Personal', desc: 'Nama setiap tamu otomatis tercetak di cover undangan lewat link unik.' },
  { title: 'RSVP Real-time', desc: 'Pantau kehadiran tamu secara langsung di dashboard.' },
  { title: 'Countdown & Musik', desc: 'Hitung mundur otomatis ke hari H dengan backsound pilihanmu.' },
  { title: 'Google Maps', desc: 'Petunjuk arah akurat ke lokasi acara.' },
  { title: 'Ucapan & Doa', desc: 'Tamu kirim doa dan harapan terbaik langsung di undangan.' },
  { title: 'Gallery Foto', desc: 'Abadikan momen spesial dengan galeri foto & video.' },
]

export default async function HomePage() {
  const [plans, templates] = await Promise.all([
    db.plan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    db.template.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' }, take: 4 }),
  ])

  return (
    <main className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-rose-500">
            Undangan Digital Premium
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
            Buat undangan pernikahan digitalmu{' '}
            <span className="text-rose-500">dalam hitungan menit</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
            Berlangganan, pilih tema, isi data acara, dan bagikan ke semua tamu. RSVP, ucapan, dan
            statistik kehadiran terkumpul otomatis.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-rose-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-600"
            >
              Mulai Gratis
            </Link>
            <Link
              href="/templates"
              className="rounded-full border border-stone-300 px-8 py-3 text-base font-semibold text-stone-700 hover:bg-stone-50"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-stone-900">Fitur Premium</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-stone-500">
          Semua yang kamu butuhkan untuk undangan digital yang elegan dan terorganisir.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone-200 p-6 transition hover:border-rose-200 hover:shadow-md">
              <h3 className="text-lg font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-stone-900">Katalog Tema</h2>
              <p className="mt-2 text-stone-500">Pilih tema favorit untuk momen spesialmu.</p>
            </div>
            <Link href="/templates" className="text-sm font-semibold text-rose-600 hover:text-rose-700">
              Lihat semua &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/templates/${t.slug}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100">
                  <span className="font-serif text-2xl text-rose-700">{t.name}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900">{t.name}</h3>
                  <p className="mt-1 text-sm text-stone-500">{t.free ? 'Gratis' : formatRupiah(t.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="paket" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-stone-900">Pilih Paket</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-stone-500">
          Berlangganan dan buka semua fitur. Batalkan kapan saja.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-8 ${
                p.code === 'PRO' ? 'border-rose-300 bg-rose-50 shadow-lg' : 'border-stone-200'
              }`}
            >
              <h3 className="text-lg font-semibold text-stone-900">{p.name}</h3>
              <p className="mt-1 text-sm text-stone-500">{p.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-stone-900">{formatRupiah(p.price)}</span>
                <span className="text-sm text-stone-500"> / {p.period.toLowerCase()}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-stone-600">
                <li>{p.maxPages === 0 ? 'Undangan tanpa batas' : `Maks. ${p.maxPages} undangan`}</li>
                <li>{p.maxGuests === 0 ? 'Tamu tanpa batas' : `Maks. ${p.maxGuests} tamu/undangan`}</li>
                <li>RSVP & Ucapan</li>
                <li>{p.analytics ? 'Analitik & ekspor data' : 'Analitik tidak tersedia'}</li>
                <li>{p.noBranding ? 'Tanpa branding FAAS' : 'Branding FAAS'}</li>
              </ul>
              <Link
                href="/register"
                className={`mt-8 rounded-full py-3 text-center text-sm font-semibold ${
                  p.code === 'PRO'
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {p.price === 0 ? 'Coba Gratis' : 'Berlangganan'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Siap membuat momen tak terlupakan?</h2>
          <p className="mt-3 text-stone-400">Daftar gratis dan buat undangan pertamamu sekarang.</p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-rose-500 px-8 py-3 font-semibold text-white hover:bg-rose-600"
          >
            Daftar Gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-400">
          &copy; {new Date().getFullYear()} LoveOnThe.Cloud Wedding Invitation. Semua hak dilindungi.
        </div>
      </footer>
    </main>
  )
}
