import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/badge'
import { publishInvitation, unpublishInvitation } from '@/lib/actions/invitations'
import { addGuest, deleteGuest, markGuestSent, toggleWishVisibility, deleteWish, bulkImportGuests } from '@/lib/actions/guests'
import { Label, Input } from '@/components/form'
import { CopyButton } from '@/components/copy-button'
import { ConfirmFormButton } from '@/components/confirm-form-button'
import { ExportCsvButton } from '@/components/export-csv-button'
import { GuestImportArea } from '@/components/guest-import-area'

export const dynamic = 'force-dynamic'

export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()

  const invitation = await db.invitation.findFirst({
    where: { id, userId: session.userId },
    include: {
      template: true,
      guests: { include: { rsvp: true }, orderBy: { createdAt: 'asc' } },
      wishes: { orderBy: { createdAt: 'desc' } },
      rsvps: true,
    },
  })

  if (!invitation) notFound()

  const rsvpCounts = {
    yes: invitation.rsvps.filter((r) => r.status === 'YES').length,
    maybe: invitation.rsvps.filter((r) => r.status === 'MAYBE').length,
    no: invitation.rsvps.filter((r) => r.status === 'NO').length,
  }
  const totalAttendees = invitation.rsvps.reduce(
    (sum, r) => sum + (r.status === 'YES' ? r.qtyAdult + r.qtyChild : 0),
    0
  )
  const openedCount = invitation.guests.filter((g) => g.openedAt).length
  const publicUrl = `${process.env.APP_URL || 'http://localhost:3000'}/u/${invitation.slug}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-900">{invitation.title}</h2>
            <Badge color={invitation.status === 'PUBLISHED' ? 'green' : 'amber'}>
              {invitation.status === 'PUBLISHED' ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-stone-500">Tema: {invitation.template.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/invitations/${invitation.id}/edit`}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Edit
          </Link>
          {invitation.status === 'DRAFT' ? (
            <form action={publishInvitation}>
              <input type="hidden" name="id" value={invitation.id} />
              <button className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                Publish
              </button>
            </form>
          ) : (
            <form action={unpublishInvitation}>
              <input type="hidden" name="id" value={invitation.id} />
              <button className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                Unpublish
              </button>
            </form>
          )}
          <a
            href={`/u/${invitation.slug}`}
            target="_blank"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Lihat Halaman
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">RSVP Hadir</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{rsvpCounts.yes}</p>
          <p className="mt-1 text-xs text-stone-400">±{totalAttendees} orang</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Ragu-ragu</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{rsvpCounts.maybe}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Tidak Hadir</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{rsvpCounts.no}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Undangan Dibuka</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">
            {openedCount}/{invitation.guests.length}
          </p>
          <p className="mt-1 text-xs text-stone-400">guest opens</p>
        </div>
      </div>

      {/* Share link */}
      {invitation.status === 'PUBLISHED' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="font-semibold text-stone-900">Link Undangan</h3>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">
              {publicUrl}
            </code>
            <CopyButton text={publicUrl} />
          </div>
        </div>
      )}

      {/* Guests */}
      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-stone-900">Manajemen Tamu</h3>
              <p className="mt-1 text-sm text-stone-500">
                {invitation.guests.length} tamu terdaftar. Setiap tamu punya link unik.
              </p>
            </div>
            <ExportCsvButton invitationId={invitation.id} />
          </div>
        </div>

        {/* Bulk import */}
        <form action={bulkImportGuests} className="border-b border-stone-200 bg-stone-50/50 p-6">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <h4 className="mb-2 text-sm font-semibold text-stone-700">Import Banyak Tamu</h4>
          <p className="mb-3 text-xs text-stone-500">
            Tulis satu nama per baris, atau pilih langsung dari kontak HP (di browser mobile).
          </p>
          <GuestImportArea />
          <button type="submit" className="mt-3 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-800">
            Import Tamu
          </button>
        </form>

        {/* Add guest form */}
        <form action={addGuest} className="border-b border-stone-200 p-6">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" required placeholder="Bapak/Ibu/Sdr/i" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">WhatsApp (opsional)</Label>
              <Input id="phone" name="phone" placeholder="08xxxx" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="group">Grup</Label>
              <Input id="group" name="group" placeholder="Keluarga Groom" />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            + Tambah Tamu
          </button>
        </form>

        {/* Guest table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium">Grup</th>
                <th className="px-6 py-3 font-medium">RSVP</th>
                <th className="px-6 py-3 font-medium">Dibuka</th>
                <th className="px-6 py-3 font-medium">Dikirim</th>
                <th className="px-6 py-3 font-medium">Link</th>
                <th className="px-6 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invitation.guests.map((g) => {
                const guestUrl = `${publicUrl}?to=${encodeURIComponent(g.name)}&g=${g.token}`
                return (
                  <tr key={g.id}>
                    <td className="px-6 py-3 font-medium text-stone-900">{g.name}</td>
                    <td className="px-6 py-3 text-stone-500">{g.group ?? '-'}</td>
                    <td className="px-6 py-3">
                      {g.rsvp ? (
                        <Badge color={g.rsvp.status === 'YES' ? 'green' : g.rsvp.status === 'MAYBE' ? 'amber' : 'red'}>
                          {g.rsvp.status === 'YES' ? 'Hadir' : g.rsvp.status === 'MAYBE' ? 'Ragu' : 'Tidak'}
                          {g.rsvp.qtyAdult + g.rsvp.qtyChild > 0 ? ` (${g.rsvp.qtyAdult + g.rsvp.qtyChild})` : ''}
                        </Badge>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-stone-500">
                      {g.openedAt ? '✓' : <span className="text-stone-300">✗</span>}
                    </td>
                    <td className="px-6 py-3 text-stone-500">
                      <form action={markGuestSent}>
                        <input type="hidden" name="guestId" value={g.id} />
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <button type="submit" className="text-sm">
                          {g.sentStatus ? (
                            <span className="font-medium text-green-600">Terkirim</span>
                          ) : (
                            <span className="text-stone-400">Belum</span>
                          )}
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-3">
                      <CopyButton text={guestUrl} label="Salin" />
                    </td>
                    <td className="px-6 py-3">
                      <ConfirmFormButton
                        action={deleteGuest}
                        confirmMessage={`Hapus tamu ${g.name}?`}
                        hidden={{ guestId: g.id, invitationId: invitation.id }}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </ConfirmFormButton>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wishes */}
      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900">Ucapan & Doa ({invitation.wishes.length})</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {invitation.wishes.map((w) => (
            <div key={w.id} className="flex items-start justify-between p-6">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-stone-900">{w.name}</p>
                  {w.status !== 'VISIBLE' && <Badge color="amber">Tersembunyi</Badge>}
                </div>
                <p className="mt-1 text-sm text-stone-600">{w.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <form action={toggleWishVisibility}>
                  <input type="hidden" name="wishId" value={w.id} />
                  <input type="hidden" name="invitationId" value={invitation.id} />
                  <button type="submit" className="text-xs font-medium text-stone-600 hover:text-stone-900">
                    {w.status === 'VISIBLE' ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </form>
                <ConfirmFormButton
                  action={deleteWish}
                  confirmMessage="Hapus ucapan ini?"
                  hidden={{ wishId: w.id, invitationId: invitation.id }}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Hapus
                </ConfirmFormButton>
              </div>
            </div>
          ))}
          {invitation.wishes.length === 0 && (
            <p className="p-6 text-sm text-stone-400">Belum ada ucapan.</p>
          )}
        </div>
      </div>
    </div>
  )
}
