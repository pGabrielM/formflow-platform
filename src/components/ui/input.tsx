import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-400/20 disabled:cursor-not-allowed disabled:bg-zinc-50'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldBase, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldBase, 'min-h-28 py-3', className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(fieldBase, 'h-11 pr-8', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('field-label', className)} {...props} />
}
