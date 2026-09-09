'use client'

import { useState } from 'react'

/**
 * Button that wraps a server-action form with a confirm() gate.
 * Must be a Client Component because confirm() is browser-only.
 */
export function ConfirmFormButton({
  action,
  children,
  confirmMessage,
  className,
  hidden,
}: {
  action: (formData: FormData) => Promise<void>
  children: React.ReactNode
  confirmMessage: string
  className?: string
  hidden?: Record<string, string>
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {Object.entries(hidden ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  )
}
