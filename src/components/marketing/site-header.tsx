import Link from 'next/link'
import { Github } from '@/components/marketing/github-icon'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <header className="glass mx-auto flex h-14 max-w-5xl items-center gap-6 rounded-full px-4 pr-2">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-semibold text-zinc-600 md:flex">
          {[
            ['#recursos', 'Recursos'],
            ['#como-funciona', 'Como funciona'],
            ['#stack', 'Tecnologia'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3 py-1.5 hover:bg-white hover:text-zinc-900">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="size-5" />
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Testar demo</Link>
          </Button>
        </div>
      </header>
    </div>
  )
}
