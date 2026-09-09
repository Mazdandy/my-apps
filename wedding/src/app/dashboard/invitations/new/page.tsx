import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { InvitationBuilder } from '@/components/invitation-builder'

export const dynamic = 'force-dynamic'

export default async function NewInvitationPage() {
  const session = await verifySession()

  const [templates, activeSubscription, invitationCount] = await Promise.all([
    db.template.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    db.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: { plan: true },
    }),
    db.invitation.count({ where: { userId: session.userId } }),
  ])

  // Enforce plan page limit (0 = unlimited)
  const limit = activeSubscription?.plan.maxPages ?? 1
  if (limit !== 0 && invitationCount >= limit) {
    redirect('/dashboard/subscription?limit=1')
  }

  const templateOptions = templates.map((t) => ({ id: t.id, name: t.name }))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Buat Undangan Baru</h2>
        <p className="mt-1 text-sm text-stone-500">Isi data undanganmu, lalu publish saat siap.</p>
      </div>
      <InvitationBuilder templates={templateOptions} />
    </div>
  )
}
