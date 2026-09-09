import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { notFound } from 'next/navigation'
import { InvitationBuilder } from '@/components/invitation-builder'

export const dynamic = 'force-dynamic'

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()

  const [invitation, templates] = await Promise.all([
    db.invitation.findFirst({ where: { id, userId: session.userId } }),
    db.template.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  if (!invitation) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Edit Undangan</h2>
        <p className="mt-1 text-sm text-stone-500">Perbarui data undanganmu. Link lama tetap berfungsi jika URL diubah.</p>
      </div>
      <InvitationBuilder
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        invitation={{
          id: invitation.id,
          title: invitation.title,
          slug: invitation.slug,
          templateId: invitation.templateId,
          eventAt: invitation.eventAt.toISOString(),
          data: invitation.data,
        }}
      />
    </div>
  )
}
