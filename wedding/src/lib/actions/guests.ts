'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { randomUUID } from 'node:crypto'

const guestSchema = z.object({
  invitationId: z.string(),
  name: z.string().trim().min(2),
  phone: z.string().trim().optional().default(''),
  group: z.string().trim().optional().default(''),
})

export async function addGuest(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const parsed = guestSchema.safeParse({
    invitationId: formData.get('invitationId'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    group: formData.get('group'),
  })

  if (!parsed.success) return

  const invitation = await db.invitation.findFirst({
    where: { id: parsed.data.invitationId, userId: session.userId },
  })
  if (!invitation) return

  await db.guest.create({
    data: {
      invitationId: parsed.data.invitationId,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      group: parsed.data.group || null,
      token: randomUUID(),
    },
  })

  revalidatePath(`/dashboard/invitations/${parsed.data.invitationId}`)
}

// Import many guests at once: one per line. Lines can be:
//   "Nama"  or  "Nama | 08xxxxxxxx"
export async function bulkImportGuests(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const invitationId = formData.get('invitationId')?.toString()
  const namesText = formData.get('names')?.toString() ?? ''
  const group = formData.get('group')?.toString() ?? ''

  if (!invitationId) return

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: session.userId },
  })
  if (!invitation) return

  const entries = namesText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 2)
    .map((line) => {
      const [name, phone] = line.split('|').map((s) => s.trim())
      return { name, phone: phone || null }
    })

  if (entries.length === 0) return

  await db.guest.createMany({
    data: entries.map((e) => ({
      invitationId,
      name: e.name,
      phone: e.phone,
      group: group || null,
      token: randomUUID(),
    })),
  })

  revalidatePath(`/dashboard/invitations/${invitationId}`)
}

export async function deleteGuest(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const guestId = formData.get('guestId')?.toString()
  const invitationId = formData.get('invitationId')?.toString()
  if (!guestId || !invitationId) return

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: session.userId },
  })
  if (!invitation) return

  await db.rsvp.deleteMany({ where: { guestId } })
  await db.guest.delete({ where: { id: guestId } })

  revalidatePath(`/dashboard/invitations/${invitationId}`)
}

export async function markGuestSent(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const guestId = formData.get('guestId')?.toString()
  const invitationId = formData.get('invitationId')?.toString()
  if (!guestId || !invitationId) return

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: session.userId },
  })
  if (!invitation) return

  const guest = await db.guest.findUnique({ where: { id: guestId } })
  if (!guest) return

  await db.guest.update({
    where: { id: guestId },
    data: { sentStatus: !guest.sentStatus },
  })

  revalidatePath(`/dashboard/invitations/${invitationId}`)
}

export async function toggleWishVisibility(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const wishId = formData.get('wishId')?.toString()
  const invitationId = formData.get('invitationId')?.toString()
  if (!wishId || !invitationId) return

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: session.userId },
  })
  if (!invitation) return

  const wish = await db.wish.findUnique({ where: { id: wishId } })
  if (!wish) return

  await db.wish.update({
    where: { id: wishId },
    data: { status: wish.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE' },
  })

  revalidatePath(`/dashboard/invitations/${invitationId}`)
}

export async function deleteWish(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const wishId = formData.get('wishId')?.toString()
  const invitationId = formData.get('invitationId')?.toString()
  if (!wishId || !invitationId) return

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: session.userId },
  })
  if (!invitation) return

  await db.wish.delete({ where: { id: wishId } })

  revalidatePath(`/dashboard/invitations/${invitationId}`)
}
