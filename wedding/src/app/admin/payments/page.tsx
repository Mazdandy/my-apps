import { db } from '@/lib/db'
import { formatRupiah } from '@/lib/utils'
import { updatePaymentStatus } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, subscription: { include: { plan: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Pembayaran</h2>
        <p className="mt-1 text-sm text-stone-500">Kelola transaksi dan status pembayaran.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium">Referensi</th>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Paket</th>
              <th className="px-6 py-3 font-medium">Jumlah</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Tanggal</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-3 font-mono text-stone-600">{p.reference ?? '-'}</td>
                <td className="px-6 py-3 text-stone-900">{p.user.name}</td>
                <td className="px-6 py-3 text-stone-500">{p.subscription?.plan.name ?? '-'}</td>
                <td className="px-6 py-3 text-stone-600">{formatRupiah(p.amount)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : p.status === 'REFUNDED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-stone-500">
                  {p.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-3">
                  <form action={updatePaymentStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <select
                      name="status"
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      defaultValue={p.status}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
