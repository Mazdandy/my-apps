import { Logo } from '@/components/logo'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        {children}
      </div>
      <p className="mt-6 text-xs text-stone-400">
        &copy; {new Date().getFullYear()} FAAS Wedding Invitation
      </p>
      <Link href="/" className="mt-2 text-xs text-stone-400 hover:text-stone-600">
        Kembali ke beranda
      </Link>
    </div>
  )
}
