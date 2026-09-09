import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import Link from 'next/link'
import { Badge } from '@/components/badge'
import { publishInvitation, unpublishInvitation, deleteInvitation } from '@/lib/actions/invitations'
import { ConfirmFormButton } from '@/components/confirm-form-button'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const session = await verifySession()
  const invitations = await db.invitation.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      template: true,
      _count: { select: { guests: true, rsvps: true, wishes: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Undanganku</h2>
          <p className="mt-1 text-sm text-stone-500">Kelola semua undangan digitalmu.</p>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          + Buat Undangan
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
          <p className="text-3xl">💌</p>
          <h3 className="mt-4 text-lg font-semibold text-stone-900">Belum ada undangan</h3>
          <p className="mt-1 text-sm text-stone-500">Mulai dengan membuat undangan digital pertamamu.</p>
          <Link
            href="/dashboard/invitations/new"
            className="mt-6 inline-block rounded-full bg-rose-500 px-8 py-3 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Buat Undangan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => {
            const publicUrl = inv.status === 'PUBLISHED' ? `/u/${inv.slug}` : null
            return (
              <div key={inv.id} className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-stone-900">{inv.title}</h3>
                      <Badge color={inv.status === 'PUBLISHED' ? 'green' : 'amber'}>
                        {inv.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-stone-500">Tema: {inv.template.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{inv._count.guests} tamu</span>·<span>{inv._count.rsvps} RSVP</span>·
                    <span>{inv._count.wishes} ucapan</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/dashboard/invitations/${inv.id}`}
                    className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                  >
                    Kelola
                  </Link>
                  {publicUrl && (
                    <Link
                      href={publicUrl}
                      target="_blank"
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      Lihat Halaman
                    </Link>
                  )}
                  {inv.status === 'DRAFT' ? (
                    <form action={publishInvitation}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button type="submit" className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700">
                        Publish
                      </button>
                    </form>
                  ) : (
                    <form action={unpublishInvitation}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button type="submit" className="rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        Unpublish
                      </button>
                    </form>
                  )}
                  <ConfirmFormButton
                    action={deleteInvitation}
                    confirmMessage="Hapus undangan ini?"
                    hidden={{ id: inv.id }}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </ConfirmFormButton>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
