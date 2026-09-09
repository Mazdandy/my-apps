'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register, type RegisterState } from '@/lib/actions/auth'
import { Label, Input, SubmitButton } from '@/components/form'

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" required placeholder="Nama lengkap" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="kamu@email.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required placeholder="Minimal 6 karakter" />
      </div>
      <SubmitButton pending={pending}>Daftar</SubmitButton>
      <p className="text-center text-sm text-stone-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-rose-600 hover:text-rose-700">
          Masuk
        </Link>
      </p>
    </form>
  )
}
