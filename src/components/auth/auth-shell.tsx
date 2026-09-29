import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { siteConfig } from '@/config/site'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="absolute top-6 left-6">
        <Logo />
      </Link>
      <div className="glass w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-1.5 mb-8 text-sm text-zinc-600">{subtitle}</p>
        {children}
      </div>
      <ul className="mt-8 flex max-w-md flex-col items-center gap-2 text-center text-xs font-semibold text-zinc-600">
        {siteConfig.highlights.map((item) => (
          <li key={item} className="glass rounded-2xl px-4 py-1.5">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
