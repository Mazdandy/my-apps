'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'

const loginSchema = z.object({
  email: z.email('Email tidak valid').trim().toLowerCase(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type LoginState = { error?: string } | undefined

export async function login(prevState: LoginState, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (!user) {
    return { error: 'Email atau password salah' }
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!valid) {
    return { error: 'Email atau password salah' }
  }

  await createSession(user.id, user.role)
  redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard')
}

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').trim(),
  email: z.email('Email tidak valid').trim().toLowerCase(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type RegisterState = { error?: string } | undefined

export async function register(prevState: RegisterState, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) {
    return { error: 'Email sudah terdaftar' }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  })

  await createSession(user.id, 'USER')
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}
