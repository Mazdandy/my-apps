import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { formatRupiah } from '@/lib/utils'
import { subscribeToPlan } from '@/lib/actions/subscription'
import { Badge } from '@/components/badge'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; success?: string }>
}) {
  const sp = await searchParams
  const session = await verifySession()

  const [plans, activeSubscription, payments] = await Promise.all([
    db.plan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    db.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: { plan: true },
    }),
    db.payment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Langganan</h2>
        <p className="mt-1 text-sm text-stone-500">Kelola paket dan riwayat pembayaranmu.</p>
      </div>

      {sp.success === '1' && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="font-semibold text-green-800">Pembayaran berhasil! 🎉</p>
          <p className="mt-1 text-sm text-green-700">Langgananmu sekarang aktif.</p>
        </div>
      )}

      {sp.limit === '1' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-800">Batas undangan tercapai</p>
          <p className="mt-1 text-sm text-amber-700">
            Upgrade paketmu untuk membuat lebih banyak undangan.
          </p>
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900">Paket Aktif</h3>
            {activeSubscription ? (
              <>
                <p className="mt-1 text-lg font-bold text-rose-600">{activeSubscription.plan.name}</p>
                <p className="text-sm text-stone-500">
                  Aktif sampai{' '}
                  {activeSubscription.endsAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-stone-500">Belum ada paket aktif. Pilih di bawah.</p>
            )}
          </div>
          {activeSubscription && <Badge color="green">Aktif</Badge>}
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isActive = activeSubscription?.planId === plan.id
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.code === 'PRO' ? 'border-rose-300 bg-rose-50' : 'border-stone-200 bg-white'
              }`}
            >
              <h3 className="text-lg font-semibold text-stone-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-stone-500">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-stone-900">{formatRupiah(plan.price)}</span>
                <span className="text-sm text-stone-500"> / {plan.period.toLowerCase()}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-stone-600">
                <li>{plan.maxPages === 0 ? 'Undangan tanpa batas' : `Maks. ${plan.maxPages} undangan`}</li>
                <li>{plan.maxGuests === 0 ? 'Tamu tanpa batas' : `Maks. ${plan.maxGuests} tamu/undangan`}</li>
                <li>RSVP & Ucapan</li>
                <li>{plan.analytics ? 'Analitik & ekspor data' : 'Tanpa analitik'}</li>
              </ul>
              {isActive ? (
                <div className="mt-6 rounded-full bg-green-100 py-2.5 text-center text-sm font-semibold text-green-700">
                  Paket Aktif
                </div>
              ) : (
                <form action={subscribeToPlan}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <button
                    type="submit"
                    className={`mt-6 w-full rounded-full py-2.5 text-sm font-semibold ${
                      plan.code === 'PRO'
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {plan.price === 0 ? 'Aktifkan Gratis' : `Langganan ${formatRupiah(plan.price)}`}
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white">
          <div className="border-b border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900">Riwayat Pembayaran</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-6 py-3 font-medium">Referensi</th>
                <th className="px-6 py-3 font-medium">Jumlah</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3 font-mono text-stone-600">{p.reference ?? '-'}</td>
                  <td className="px-6 py-3 text-stone-600">{formatRupiah(p.amount)}</td>
                  <td className="px-6 py-3">
                    <Badge color={p.status === 'PAID' ? 'green' : p.status === 'PENDING' ? 'amber' : 'red'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-stone-500">
                    {p.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
