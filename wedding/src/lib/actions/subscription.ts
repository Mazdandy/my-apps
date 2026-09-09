'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { randomUUID } from 'node:crypto'

// Mock checkout: creates a pending payment + subscription, then marks it paid.
// This is the seam where a real payment gateway (Midtrans/Xendit) would plug in.

export async function subscribeToPlan(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'USER') return

  const planId = formData.get('planId')?.toString()
  if (!planId) return

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return

  // Expire any existing active subscription
  await db.subscription.updateMany({
    where: { userId: session.userId, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  })

  const now = new Date()
  const subscription = await db.subscription.create({
    data: {
      userId: session.userId,
      planId: plan.id,
      status: 'ACTIVE',
      startsAt: now,
      endsAt: new Date(now.getTime() + plan.periodDays * 24 * 60 * 60 * 1000),
    },
  })

  await db.payment.create({
    data: {
      userId: session.userId,
      subscriptionId: subscription.id,
      amount: plan.price,
      gateway: 'mock',
      status: 'PAID',
      reference: `PAY-${randomUUID().slice(0, 8).toUpperCase()}`,
      paidAt: now,
    },
  })

  revalidatePath('/dashboard')
  redirect('/dashboard/subscription?success=1')
}
