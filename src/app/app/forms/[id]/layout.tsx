import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { FormActions } from '@/components/forms/form-actions'
import { FormTabs } from '@/components/forms/form-tabs'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { formStatusLabel, formStatusTone } from '@/lib/status'

export default async function FormLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const form = await prisma.form.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true, title: true, slug: true, status: true, _count: { select: { responses: true } } },
  })
  if (!form) notFound()

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/app" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="size-4" /> Formulários
      </Link>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-xl font-semibold tracking-tight">{form.title}</h1>
          <Badge tone={formStatusTone[form.status]}>{formStatusLabel[form.status]}</Badge>
        </div>
        <FormActions formId={form.id} slug={form.slug} status={form.status} />
      </div>
      <div className="mb-6 border-b border-zinc-200">
        <FormTabs formId={form.id} responses={form._count.responses} />
      </div>
      {children}
    </div>
  )
}
