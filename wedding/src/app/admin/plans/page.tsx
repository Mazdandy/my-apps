import { db } from '@/lib/db'
import { formatRupiah } from '@/lib/utils'
import { createPlan, togglePlanActive } from '@/lib/actions/admin'
import { Label, Input } from '@/components/form'
import { Badge } from '@/components/badge'

export const dynamic = 'force-dynamic'

const periods = [
  { value: 'MONTHLY', label: 'Bulanan' },
  { value: 'QUARTERLY', label: '3 Bulan' },
  { value: 'SEMIANNUAL', label: '6 Bulan' },
  { value: 'ANNUAL', label: 'Tahunan' },
]

export default async function AdminPlansPage() {
  const plans = await db.plan.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Manajemen Paket</h2>
        <p className="mt-1 text-sm text-stone-500">Kelola paket langganan dan batas fitur.</p>
      </div>

      {/* Create form */}
      <form action={createPlan} className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-stone-900">Tambah Paket Baru</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="code">Kode</Label>
            <Input id="code" name="code" required placeholder="PRO" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" required placeholder="Pro" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input id="price" name="price" type="number" min={0} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="period">Periode</Label>
            <select id="period" name="period" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
              {periods.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="periodDays">Durasi (hari)</Label>
            <Input id="periodDays" name="periodDays" type="number" min={1} required defaultValue={90} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxPages">Maks Undangan (0 = tanpa batas)</Label>
            <Input id="maxPages" name="maxPages" type="number" min={0} required defaultValue={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxGuests">Maks Tamu (0 = tanpa batas)</Label>
            <Input id="maxGuests" name="maxGuests" type="number" min={0} required defaultValue={500} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-stone-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="analytics" className="h-4 w-4 rounded border-stone-300" />
            Analitik
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="noBranding" className="h-4 w-4 rounded border-stone-300" />
            Tanpa branding
          </label>
        </div>
        <button type="submit" className="mt-4 rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
          Simpan Paket
        </button>
      </form>

      {/* List */}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">{p.name}</h3>
              <Badge color={p.active ? 'green' : 'stone'}>{p.active ? 'Aktif' : 'Nonaktif'}</Badge>
            </div>
            <p className="mt-1 text-sm text-stone-500">{p.code}</p>
            <p className="mt-3 text-2xl font-bold text-stone-900">{formatRupiah(p.price)}</p>
            <ul className="mt-3 space-y-1 text-sm text-stone-600">
              <li>Maks {p.maxPages === 0 ? '∞' : p.maxPages} undangan</li>
              <li>Maks {p.maxGuests === 0 ? '∞' : p.maxGuests} tamu/undangan</li>
              <li>{p.analytics ? '✓ Analitik' : '✗ Analitik'}</li>
              <li>{p.noBranding ? '✓ Tanpa branding' : '✗ Branding FAAS'}</li>
            </ul>
            <form action={togglePlanActive} className="mt-4">
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="w-full rounded-full border border-stone-300 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                {p.active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
