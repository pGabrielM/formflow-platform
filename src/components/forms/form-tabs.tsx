'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function FormTabs({ formId, responses }: { formId: string; responses: number }) {
  const pathname = usePathname()
  const tabs = [
    { href: `/app/forms/${formId}/responses`, label: `Respostas (${responses})` },
    { href: `/app/forms/${formId}/edit`, label: 'Editar' },
    { href: `/app/forms/${formId}/share`, label: 'Compartilhar' },
  ]
  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'border-b-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors',
            pathname.startsWith(tab.href) ? 'border-brand-600 text-brand-700' : 'border-transparent text-zinc-500 hover:text-zinc-800',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
