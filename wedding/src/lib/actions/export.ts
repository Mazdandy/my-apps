'use server'

import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'

function escapeCsv(value: string | null | undefined) {
  const s = value ?? ''
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function exportGuestsCsv(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return { error: 'Unauthorized' }

  const invitationId = formData.get('invitationId')?.toString()
  if (!invitationId) return { error: 'ID tidak valid' }

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: session.userId },
    include: {
      guests: { include: { rsvp: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!invitation) return { error: 'Undangan tidak ditemukan' }

  const rows = [
    ['Nama', 'Grup', 'WhatsApp', 'Status RSVP', 'Dewasa', 'Anak', 'Link'],
    ...invitation.guests.map((g) => [
      g.name,
      g.group ?? '',
      g.phone ?? '',
      g.rsvp?.status ?? 'Belum',
      g.rsvp ? String(g.rsvp.qtyAdult) : '',
      g.rsvp ? String(g.rsvp.qtyChild) : '',
      `${process.env.APP_URL || 'http://localhost:3000'}/u/${invitation.slug}?to=${encodeURIComponent(g.name)}&g=${g.token}`,
    ]),
  ]

  const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
  const base64 = Buffer.from('\uFEFF' + csv).toString('base64')

  return {
    ok: true,
    filename: `tamu-${invitation.slug}.csv`,
    data: base64,
  }
}
