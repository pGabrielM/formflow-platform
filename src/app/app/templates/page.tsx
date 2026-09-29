import type { Metadata } from 'next'
import { TemplatePicker } from '@/components/forms/template-picker'
import { PageHeader } from '@/components/shell/page-header'
import { TEMPLATES } from '@/lib/templates'

export const metadata: Metadata = { title: 'Modelos' }

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Modelos" description="Comece com um modelo pronto e adapte as perguntas." />
      <TemplatePicker templates={TEMPLATES} />
    </div>
  )
}
