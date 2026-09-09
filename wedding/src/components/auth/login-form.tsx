'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type LoginState } from '@/lib/actions/auth'
import { Label, Input, SubmitButton } from '@/components/form'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="kamu@email.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required placeholder="••••••••" />
      </div>
      <SubmitButton pending={pending}>Masuk</SubmitButton>
      <p className="text-center text-sm text-stone-500">
        Belum punya akun?{' '}
        <Link href="/register" className="font-medium text-rose-600 hover:text-rose-700">
          Daftar gratis
        </Link>
      </p>
    </form>
  )
}
