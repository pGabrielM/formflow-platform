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
    <nav className="inline-flex gap-1 overflow-x-auto rounded-full border border-white bg-white/70 p-1 shadow-soft">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
            pathname.startsWith(tab.href) ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
