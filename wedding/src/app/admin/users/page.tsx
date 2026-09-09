import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { Badge } from '@/components/badge'
import { toggleUserBlocked } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await verifySession()
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invitations: true, subscriptions: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Pengguna</h2>
        <p className="mt-1 text-sm text-stone-500">{users.length} total pengguna terdaftar.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium">Nama</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Undangan</th>
              <th className="px-6 py-3 font-medium">Langganan</th>
              <th className="px-6 py-3 font-medium">Daftar</th>
              <th className="px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-3 font-medium text-stone-900">{u.name}</td>
                <td className="px-6 py-3 text-stone-600">{u.email}</td>
                <td className="px-6 py-3">
                  <Badge color={u.role === 'ADMIN' ? 'blue' : 'stone'}>{u.role}</Badge>
                </td>
                <td className="px-6 py-3 text-stone-600">{u._count.invitations}</td>
                <td className="px-6 py-3 text-stone-600">{u._count.subscriptions}</td>
                <td className="px-6 py-3 text-stone-500">
                  {u.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-3">
                  {u.id !== session.userId && (
                    <form action={toggleUserBlocked}>
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'border border-stone-300 text-stone-600 hover:bg-stone-50'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'Jadikan User' : 'Jadikan Admin'}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
