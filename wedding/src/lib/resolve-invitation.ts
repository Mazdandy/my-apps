import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

/**
 * Resolve an invitation by public slug, following aliases (old URLs)
 * so that a changed slug keeps the old link working.
 * Returns null when not found.
 */
export async function resolveInvitationBySlug(slug: string) {
  const invitation = await db.invitation.findFirst({
    where: { slug, status: 'PUBLISHED' },
  })

  if (invitation) return invitation

  // Not a direct slug — check alias table (old URL after slug change)
  const alias = await db.invitationAlias.findUnique({
    where: { slug },
    include: { invitation: true },
  })

  if (alias && alias.invitation.status === 'PUBLISHED') {
    // Keep query params (guest token/name) intact
    return { ...alias.invitation, __redirectTo: `/u/${alias.invitation.slug}` }
  }

  return null
}
