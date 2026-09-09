import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Daftar - FAAS',
}

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-center text-2xl font-bold text-stone-900">Daftar Akun</h1>
      <p className="mb-6 text-center text-sm text-stone-500">Mulai buat undangan digitalmu</p>
      <RegisterForm />
    </>
  )
}
