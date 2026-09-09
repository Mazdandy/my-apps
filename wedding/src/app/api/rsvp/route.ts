import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const schema = z.object({
  invitationId: z.string(),
  name: z.string().trim().min(2),
  status: z.enum(['YES', 'MAYBE', 'NO']),
  qtyAdult: z.number().int().min(0).max(50),
  qtyChild: z.number().int().min(0).max(50),
  note: z.string().trim().max(500).optional().default(''),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    const { invitationId, name, status, qtyAdult, qtyChild, note } = parsed.data

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { guests: { where: { name } } },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })
    }

    // Find matching guest by name, or create an anonymous guest
    let guest = invitation.guests[0]
    if (!guest) {
      guest = await db.guest.create({
        data: {
          invitationId,
          name,
          token: crypto.randomUUID(),
        },
      })
    }

    await db.rsvp.upsert({
      where: { guestId: guest.id },
      update: { status, qtyAdult, qtyChild, note },
      create: {
        invitationId,
        guestId: guest.id,
        status,
        qtyAdult,
        qtyChild,
        note,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
