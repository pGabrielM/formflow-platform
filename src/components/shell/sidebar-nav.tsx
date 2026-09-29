'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { appNav } from '@/config/nav'
import { cn } from '@/lib/utils'

/** Pílulas horizontais no cabeçalho (desktop) ou lista vertical (menu mobile). */
export function SidebarNav({ onNavigate, horizontal = false }: { onNavigate?: () => void; horizontal?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex', horizontal ? 'items-center gap-1' : 'flex-col gap-1')}>
      {appNav.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-white hover:text-zinc-900',
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
