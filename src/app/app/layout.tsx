import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { MobileNav } from '@/components/shell/mobile-nav'
import { SidebarNav } from '@/components/shell/sidebar-nav'
import { UserMenu } from '@/components/shell/user-menu'
import { siteConfig } from '@/config/site'
import { requireUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const isDemo = user.email === siteConfig.demo.email

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-4">
        <header className="glass mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-full px-3 sm:px-4">
          <MobileNav />
          <Link href="/app" className="px-1">
            <Logo />
          </Link>
          <div className="mx-auto hidden lg:block">
            <SidebarNav horizontal />
          </div>
          {isDemo && (
            <span className="ml-auto hidden rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800 sm:inline lg:ml-0">
              conta demo
            </span>
          )}
          <div className={isDemo ? '' : 'ml-auto lg:ml-0'}>
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  )
}
