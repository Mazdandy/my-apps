export function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700">
      {children}
    </label>
  )
}

export function Input({
  id,
  name,
  type = 'text',
  required,
  placeholder,
  defaultValue,
  step,
  min,
}: {
  id: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string | number
  step?: string
  min?: number
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      defaultValue={defaultValue}
      step={step}
      min={min}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
    />
  )
}

export function Textarea({
  id,
  name,
  required,
  placeholder,
  defaultValue,
  rows = 3,
}: {
  id: string
  name: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  rows?: number
}) {
  return (
    <textarea
      id={id}
      name={name}
      required={required}
      placeholder={placeholder}
      defaultValue={defaultValue}
      rows={rows}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
    />
  )
}

export function Select({
  id,
  name,
  required,
  defaultValue,
  children,
}: {
  id: string
  name: string
  required?: boolean
  defaultValue?: string
  children: React.ReactNode
}) {
  return (
    <select
      id={id}
      name={name}
      required={required}
      defaultValue={defaultValue}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
    >
      {children}
    </select>
  )
}

export function SubmitButton({ children, pending }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Memproses...' : children}
    </button>
  )
}
