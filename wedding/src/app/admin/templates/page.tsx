import { db } from '@/lib/db'
import { formatRupiah } from '@/lib/utils'
import { createTemplate, toggleTemplateActive, deleteTemplate } from '@/lib/actions/admin'
import { Label, Input, Textarea } from '@/components/form'

export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage() {
  const templates = await db.template.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Manajemen Tema</h2>
        <p className="mt-1 text-sm text-stone-500">Kelola katalog tema undangan.</p>
      </div>

      {/* Create form */}
      <form action={createTemplate} className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-stone-900">Tambah Tema Baru</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Tema</Label>
            <Input id="name" name="name" required placeholder="Syari Ivory" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              name="category"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            >
              <option value="wedding">Wedding</option>
              <option value="engagement">Engagement</option>
              <option value="birthday">Birthday</option>
              <option value="aqiqah">Aqiqah</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input id="price" name="price" type="number" min={0} defaultValue={0} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" name="free" className="h-4 w-4 rounded border-stone-300" />
          Gratis (tanpa biaya)
        </label>
        <button type="submit" className="mt-4 rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
          Simpan Tema
        </button>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium">Nama</th>
              <th className="px-6 py-3 font-medium">Kategori</th>
              <th className="px-6 py-3 font-medium">Harga</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {templates.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-3 font-medium text-stone-900">{t.name}</td>
                <td className="px-6 py-3 text-stone-500">{t.category}</td>
                <td className="px-6 py-3 text-stone-600">{t.free ? 'Gratis' : formatRupiah(t.price)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {t.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <form action={toggleTemplateActive}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-xs font-medium text-stone-600 hover:text-stone-900">
                        {t.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                    <form action={deleteTemplate} onSubmit={(e) => { if (!confirm(`Hapus tema ${t.name}?`)) e.preventDefault() }}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700">
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
