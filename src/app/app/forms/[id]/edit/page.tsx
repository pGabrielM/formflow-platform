import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FormBuilder } from '@/components/builder/form-builder'
import { getFormForEdit } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Editar formulário' }

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const form = await getFormForEdit(user.id, (await params).id)
  if (!form) notFound()

  return (
    <FormBuilder
      key={form.updatedAt.toISOString()}
      formId={form.id}
      hasResponses={form._count.responses > 0}
      initialFields={form.fields.map(({ id, type, label, helpText, required, options }) => ({ id, type, label, helpText, required, options }))}
      initialSettings={{
        title: form.title,
        description: form.description ?? '',
        submitLabel: form.submitLabel,
        successMessage: form.successMessage,
        webhookUrl: form.webhookUrl ?? '',
      }}
    />
  )
}
