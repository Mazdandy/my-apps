import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/badge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await verifySession()
  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user) return null

  const [invitations, activeSubscription] = await Promise.all([
    db.invitation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { guests: true, rsvps: true, wishes: true } } },
    }),
    db.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
    }),
  ])

  const totalGuests = invitations.reduce((sum, i) => sum + i._count.guests, 0)
  const totalRsvps = invitations.reduce((sum, i) => sum + i._count.rsvps, 0)
  const totalWishes = invitations.reduce((sum, i) => sum + i._count.wishes, 0)

  const stats = [
    { label: 'Undangan', value: invitations.length },
    { label: 'Total Tamu', value: totalGuests },
    { label: 'RSVP Masuk', value: totalRsvps },
    { label: 'Ucapan', value: totalWishes },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Halo, {user.name} 👋</h2>
          <p className="mt-1 text-sm text-stone-500">Kelola undangan digitalmu di sini.</p>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          + Buat Undangan
        </Link>
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

      {/* Subscription status */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900">Status Langganan</h3>
            {activeSubscription ? (
              <p className="mt-1 text-sm text-stone-500">
                Paket <span className="font-medium text-stone-700">{activeSubscription.plan.name}</span> aktif
                sampai {activeSubscription.endsAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ) : (
              <p className="mt-1 text-sm text-stone-500">Kamu belum berlangganan paket berbayar.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeSubscription && (
              <Badge color="green">Aktif</Badge>
            )}
            <Link href="/dashboard/subscription" className="text-sm font-semibold text-rose-600 hover:text-rose-700">
              Kelola
            </Link>
          </div>
        </div>
      </div>

      {/* Invitation list */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-stone-900">Undangan Terbaru</h3>
        {invitations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-stone-500">Belum ada undangan.</p>
            <Link href="/dashboard/invitations/new" className="mt-3 inline-block text-sm font-semibold text-rose-600 hover:text-rose-700">
              Buat undangan pertamamu &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Undangan</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Tamu</th>
                  <th className="px-6 py-3 font-medium">RSVP</th>
                  <th className="px-6 py-3 font-medium">Tanggal Acara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/invitations/${inv.id}`} className="font-medium text-stone-900 hover:text-rose-600">
                        {inv.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={inv.status === 'PUBLISHED' ? 'green' : 'amber'}>
                        {inv.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{inv._count.guests}</td>
                    <td className="px-6 py-4 text-stone-600">{inv._count.rsvps}</td>
                    <td className="px-6 py-4 text-stone-600">
                      {inv.eventAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
