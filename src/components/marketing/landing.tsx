import { ArrowRight, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Github } from '@/components/marketing/github-icon'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export type LandingContent = {
  eyebrow: string
  title: string
  subtitle: string
  screenshot: { src: string; alt: string }
  proof: string[]
  features: { icon: LucideIcon; title: string; description: string }[]
  steps: { title: string; description: string }[]
  stack: { name: string; detail: string }[]
}

export function Landing({ content }: { content: LandingContent }) {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader />
      <main>
        <section className="relative mx-auto max-w-5xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-brand-700">
            <span className="size-2 animate-pulse rounded-full bg-brand-500" /> {content.eyebrow}
          </span>
          <h1 className="mx-auto mt-7 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight text-balance text-zinc-900 sm:text-7xl">
            {content.title.split(',')[0]}
            {content.title.includes(',') && (
              <>
                , <span className="text-gradient">{content.title.split(',').slice(1).join(',')}</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-balance text-zinc-600">{content.subtitle}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                Testar com a conta demo <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                <Github className="size-4" /> Ver código-fonte
              </a>
            </Button>
          </div>
          <ul className="mt-7 flex flex-wrap justify-center gap-2 text-sm font-semibold text-zinc-700">
            {content.proof.map((item) => (
              <li key={item} className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1.5">
                <Check className="size-4 text-brand-600" strokeWidth={3} /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="absolute inset-x-10 top-10 -bottom-4 rounded-[3rem] bg-gradient-to-r from-brand-300/60 via-fuchsia-300/50 to-indigo-300/60 blur-3xl" aria-hidden />
          <div className="glass relative rounded-[2rem] p-2.5 sm:p-3">
            <Image
              src={content.screenshot.src}
              alt={content.screenshot.alt}
              width={1600}
              height={1000}
              priority
              className="rounded-3xl border border-white"
            />
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <h2 className="max-w-2xl text-4xl font-extrabold tracking-tight text-balance">
            Tudo o que você precisa, <span className="text-gradient">nada que atrapalhe</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {content.features.map((feature, index) => (
              <div
                key={feature.title}
                className={`glass p-6 transition-transform hover:-translate-y-1 ${index === 0 || index === 3 ? 'lg:col-span-4' : index > 3 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-500 text-white shadow-glow">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Como funciona</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {content.steps.map((step, index) => (
              <li key={step.title} className="glass p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="stack" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="rounded-[2rem] bg-zinc-900 p-8 text-white shadow-2xl shadow-brand-900/30 sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight">Por dentro</h2>
                <p className="mt-3 text-zinc-400">
                  Código aberto, tipado de ponta a ponta e pronto para rodar com um comando. Leia o README para a
                  arquitetura completa.
                </p>
                <Button asChild variant="secondary" className="mt-6">
                  <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                    <Github className="size-4" /> Abrir no GitHub
                  </a>
                </Button>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {content.stack.map((item) => (
                  <div key={item.name} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <dt className="font-bold text-brand-200">{item.name}</dt>
                    <dd className="mt-1 text-sm text-zinc-400">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Veja funcionando em 10 segundos</h2>
          <p className="mt-3 text-zinc-600">A conta demo já vem com dados de exemplo. Nenhum cadastro necessário.</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/login">
              Abrir a demo <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
