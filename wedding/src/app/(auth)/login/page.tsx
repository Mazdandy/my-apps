import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Masuk - FAAS',
}

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-stone-900">Masuk</h1>
      <LoginForm />
    </>
  )
}
