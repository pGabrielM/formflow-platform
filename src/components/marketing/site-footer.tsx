import { Logo } from '@/components/logo'
import { siteConfig } from '@/config/site'

export function SiteFooter() {
  return (
    <footer className="px-3 pb-6 sm:px-6">
      <div className="glass mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span>© {new Date().getFullYear()} · Open source (MIT)</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900">
            Código-fonte
          </a>
          <span>
            Feito por{' '}
            <a href={siteConfig.author.url} target="_blank" rel="noreferrer" className="font-bold text-zinc-900 hover:underline">
              {siteConfig.author.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
