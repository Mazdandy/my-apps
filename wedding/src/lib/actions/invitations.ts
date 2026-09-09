'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { slugify, isValidSlug } from '@/lib/utils'

const invitationSchema = z.object({
  title: z.string().min(2).trim(),
  templateId: z.string(),
  eventAt: z.string().min(1),
  data: z.string(), // JSON string from the form
  urlSlug: z.string().trim().min(1).max(60),
})

export type InvitationFormState = { error?: string } | undefined

function makeSlug(input: string) {
  return slugify(input) || `undangan-${Date.now().toString(36).slice(-4)}`
}

async function ensureUniqueSlug(base: string, excludeId?: string) {
  let candidate = base
  let i = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await db.invitation.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!exists || exists.id === excludeId) return candidate
    candidate = `${base}-${i}`
    i++
  }
}

export async function createInvitation(prevState: InvitationFormState, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return { error: 'Unauthorized' }

  const parsed = invitationSchema.safeParse({
    title: formData.get('title'),
    templateId: formData.get('templateId'),
    eventAt: formData.get('eventAt'),
    data: formData.get('data'),
    urlSlug: formData.get('urlSlug'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }
  }

  const template = await db.template.findUnique({
    where: { id: parsed.data.templateId },
  })
  if (!template) return { error: 'Tema tidak ditemukan' }

  const requested = parsed.data.urlSlug
  const slug = isValidSlug(requested)
    ? await ensureUniqueSlug(requested)
    : makeSlug(parsed.data.title)

  await db.invitation.create({
    data: {
      userId: session.userId,
      templateId: template.id,
      slug,
      title: parsed.data.title,
      eventAt: new Date(parsed.data.eventAt),
      data: parsed.data.data,
      status: 'DRAFT',
    },
  })

  revalidatePath('/dashboard')
  redirect('/dashboard/invitations')
}

export async function updateInvitation(prevState: InvitationFormState, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return { error: 'Unauthorized' }

  const id = formData.get('id')?.toString()
  if (!id) return { error: 'ID tidak valid' }

  const invitation = await db.invitation.findFirst({
    where: { id, userId: session.userId },
  })
  if (!invitation) return { error: 'Undangan tidak ditemukan' }

  const parsed = invitationSchema.safeParse({
    title: formData.get('title'),
    templateId: formData.get('templateId'),
    eventAt: formData.get('eventAt'),
    data: formData.get('data'),
    urlSlug: formData.get('urlSlug'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }
  }

  const template = await db.template.findUnique({
    where: { id: parsed.data.templateId },
  })
  if (!template) return { error: 'Tema tidak ditemukan' }

  // Slug change handling: keep old link working via alias
  const newSlug = isValidSlug(parsed.data.urlSlug)
    ? await ensureUniqueSlug(parsed.data.urlSlug, invitation.id)
    : invitation.slug

  if (newSlug !== invitation.slug) {
    // Record the old slug so the old link redirects to the new one
    await db.invitationAlias.upsert({
      where: { slug: invitation.slug },
      update: { invitationId: invitation.id },
      create: { slug: invitation.slug, invitationId: invitation.id },
    })
  }

  await db.invitation.update({
    where: { id },
    data: {
      slug: newSlug,
      title: parsed.data.title,
      templateId: template.id,
      eventAt: new Date(parsed.data.eventAt),
      data: parsed.data.data,
    },
  })

  revalidatePath('/dashboard/invitations')
  revalidatePath(`/dashboard/invitations/${id}`)
  redirect(`/dashboard/invitations/${id}`)
}

export async function publishInvitation(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const id = formData.get('id')?.toString()
  if (!id) return

  const invitation = await db.invitation.findFirst({
    where: { id, userId: session.userId },
  })
  if (!invitation) return

  const expiresAt = new Date(invitation.eventAt.getTime() + 365 * 24 * 60 * 60 * 1000)

  await db.invitation.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      expiresAt,
    },
  })

  revalidatePath('/dashboard/invitations')
  redirect(`/dashboard/invitations/${id}`)
}

export async function unpublishInvitation(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const id = formData.get('id')?.toString()
  if (!id) return

  await db.invitation.updateMany({
    where: { id, userId: session.userId },
    data: { status: 'DRAFT' },
  })

  revalidatePath('/dashboard/invitations')
}

export async function deleteInvitation(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const id = formData.get('id')?.toString()
  if (!id) return

  const invitation = await db.invitation.findFirst({
    where: { id, userId: session.userId },
  })
  if (!invitation) return

  await db.wish.deleteMany({ where: { invitationId: id } })
  await db.rsvp.deleteMany({ where: { invitationId: id } })
  await db.guest.deleteMany({ where: { invitationId: id } })
  await db.invitationAlias.deleteMany({ where: { invitationId: id } })
  await db.invitation.delete({ where: { id } })

  revalidatePath('/dashboard/invitations')
}
