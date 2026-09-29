import { Lock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FormRenderer } from '@/components/form/form-renderer'
import { Logo } from '@/components/logo'
import { submitResponse } from '@/lib/actions'
import { getPublicForm } from '@/lib/queries'

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ embed?: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const form = await getPublicForm((await params).slug)
  return { title: form?.title ?? 'Formulário', description: form?.description ?? undefined }
}

export default async function PublicFormPage({ params, searchParams }: Params) {
  const { slug } = await params
  const embed = (await searchParams).embed === '1'
  const form = await getPublicForm(slug)
  if (!form || form.status === 'DRAFT') notFound()

  return (
    <div className={embed ? 'bg-white' : 'min-h-screen bg-zinc-50 px-4 py-10 sm:py-16'}>
      <div className={embed ? 'p-6' : 'mx-auto max-w-2xl'}>
        <div className={embed ? '' : 'rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10'}>
          {!embed && <div className="-mx-6 -mt-6 mb-8 h-1.5 rounded-t-2xl bg-brand-600 sm:-mx-10 sm:-mt-10" />}
          {form.status === 'CLOSED' ? (
            <div className="py-10 text-center">
              <Lock className="mx-auto size-10 text-zinc-300" />
              <h1 className="mt-4 text-xl font-semibold">{form.title}</h1>
              <p className="mt-2 text-zinc-500">Este formulário não está mais recebendo respostas.</p>
            </div>
          ) : (
            <FormRenderer
              title={form.title}
              description={form.description}
              submitLabel={form.submitLabel}
              successMessage={form.successMessage}
              fields={form.fields}
              onSubmit={submitResponse.bind(null, form.slug)}
            />
          )}
        </div>
        {!embed && (
          <Link href="/" className="mx-auto mt-6 flex w-fit items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600">
            Criado com <Logo />
          </Link>
        )}
      </div>
    </div>
  )
}
