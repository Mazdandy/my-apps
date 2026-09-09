'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { slugify } from '@/lib/utils'

const templateSchema = z.object({
  name: z.string().min(2).trim(),
  category: z.string().trim().default('wedding'),
  description: z.string().trim().optional().default(''),
  price: z.coerce.number().int().min(0).default(0),
  free: z.coerce.boolean().optional(),
})

export async function createTemplate(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const parsed = templateSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description'),
    price: formData.get('price'),
    free: formData.get('free') === 'on',
  })
  if (!parsed.success) return

  const slug = `${slugify(parsed.data.name)}-${Date.now().toString(36).slice(-3)}`

  await db.template.create({
    data: {
      name: parsed.data.name,
      slug,
      category: parsed.data.category,
      description: parsed.data.description || null,
      price: parsed.data.free ? 0 : parsed.data.price,
      free: parsed.data.free,
    },
  })

  revalidatePath('/admin/templates')
}

export async function toggleTemplateActive(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const id = formData.get('id')?.toString()
  if (!id) return

  const template = await db.template.findUnique({ where: { id } })
  if (!template) return

  await db.template.update({
    where: { id },
    data: { active: !template.active },
  })

  revalidatePath('/admin/templates')
}

export async function deleteTemplate(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const id = formData.get('id')?.toString()
  if (!id) return

  await db.template.delete({ where: { id } })
  revalidatePath('/admin/templates')
}

const planSchema = z.object({
  code: z.string().trim().min(2).toUpperCase(),
  name: z.string().min(2).trim(),
  price: z.coerce.number().int().min(0),
  period: z.string().trim(),
  periodDays: z.coerce.number().int().min(1),
  maxPages: z.coerce.number().int().min(0),
  maxGuests: z.coerce.number().int().min(0),
  analytics: z.coerce.boolean().optional(),
  noBranding: z.coerce.boolean().optional(),
})

export async function createPlan(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const parsed = planSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    price: formData.get('price'),
    period: formData.get('period'),
    periodDays: formData.get('periodDays'),
    maxPages: formData.get('maxPages'),
    maxGuests: formData.get('maxGuests'),
    analytics: formData.get('analytics') === 'on',
    noBranding: formData.get('noBranding') === 'on',
  })
  if (!parsed.success) return

  const existing = await db.plan.findUnique({ where: { code: parsed.data.code as 'FREE' | 'PRO' | 'BUSINESS' } })
  if (existing) return

  await db.plan.create({
    data: {
      ...parsed.data,
      code: parsed.data.code as 'FREE' | 'PRO' | 'BUSINESS',
      period: parsed.data.period as 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL',
    },
  })

  revalidatePath('/admin/plans')
}

export async function togglePlanActive(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const id = formData.get('id')?.toString()
  if (!id) return

  const plan = await db.plan.findUnique({ where: { id } })
  if (!plan) return

  await db.plan.update({ where: { id }, data: { active: !plan.active } })
  revalidatePath('/admin/plans')
}

export async function toggleUserBlocked(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const id = formData.get('id')?.toString()
  if (!id || id === session.userId) return

  const user = await db.user.findUnique({ where: { id } })
  if (!user) return

  await db.user.update({
    where: { id },
    data: { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' },
  })

  revalidatePath('/admin/users')
}

export async function updatePaymentStatus(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') return

  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()
  if (!id || !status) return

  const payment = await db.payment.findUnique({ where: { id } })
  if (!payment) return

  await db.payment.update({
    where: { id },
    data: { status: status as 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' },
  })

  revalidatePath('/admin/payments')
}
