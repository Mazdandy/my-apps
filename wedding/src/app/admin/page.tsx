import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { formatRupiah } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await verifySession()

  const [
    userCount,
    invitationCount,
    publishedCount,
    paidRevenue,
    activeSubscriptions,
    recentPayments,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.invitation.count(),
    db.invitation.count({ where: { status: 'PUBLISHED' } }),
    db.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.payment.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { user: true } }),
    db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ])

  const stats = [
    { label: 'Total Pengguna', value: userCount },
    { label: 'Total Undangan', value: invitationCount },
    { label: 'Undangan Published', value: publishedCount },
    { label: 'Langganan Aktif', value: activeSubscriptions },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Ringkasan Platform</h2>
        <p className="mt-1 text-sm text-stone-500">Pantau pertumbuhan FAAS di sini.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="font-semibold text-stone-900">Total Pendapatan</h3>
        <p className="mt-2 text-3xl font-bold text-rose-600">
          {formatRupiah(paidRevenue._sum.amount ?? 0)}
        </p>
        <p className="mt-1 text-sm text-stone-500">dari pembayaran berstatus PAID</p>
      </div>

      {/* Recent payments */}
      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900">Pembayaran Terbaru</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Referensi</th>
              <th className="px-6 py-3 font-medium">Jumlah</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recentPayments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-3 text-stone-900">{p.user.name}</td>
                <td className="px-6 py-3 font-mono text-stone-500">{p.reference ?? '-'}</td>
                <td className="px-6 py-3 text-stone-600">{formatRupiah(p.amount)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent users */}
      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900">Pengguna Terbaru</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-stone-900">{u.name}</p>
                <p className="text-sm text-stone-500">{u.email}</p>
              </div>
              <span className="text-xs text-stone-400">{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
