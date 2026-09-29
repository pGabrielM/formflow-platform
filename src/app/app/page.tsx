import { BarChart3, FileText, Inbox, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TemplatePicker } from '@/components/forms/template-picker'
import { PageHeader } from '@/components/shell/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRelative } from '@/lib/format'
import { getForms } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { formStatusLabel, formStatusTone } from '@/lib/status'
import { TEMPLATES } from '@/lib/templates'

export const metadata: Metadata = { title: 'Formulários' }

export default async function FormsPage() {
  const user = await requireUser()
  const forms = await getForms(user.id)
  const totalResponses = forms.reduce((sum, form) => sum + form._count.responses, 0)
  const last7 = forms.reduce((sum, form) => sum + form.last7Days, 0)
  const published = forms.filter((form) => form.status === 'PUBLISHED').length

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Formulários"
        description="Crie, publique e acompanhe as respostas."
        actions={
          <Button asChild>
            <Link href="/app/templates">
              <Plus /> Novo formulário
            </Link>
          </Button>
        }
      />

      {forms.length === 0 ? (
        <div>
          <p className="mb-4 text-sm text-zinc-600">Escolha um modelo para começar:</p>
          <TemplatePicker templates={TEMPLATES} />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Respostas no total', value: totalResponses, icon: Inbox },
              { label: 'Nos últimos 7 dias', value: last7, icon: BarChart3 },
              { label: 'Formulários publicados', value: published, icon: FileText },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <stat.icon className="mb-2 size-4 text-brand-600" />
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Formulário</th>
                  <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Status</th>
                  <th className="px-3 py-2.5 text-right font-medium">Respostas</th>
                  <th className="hidden px-5 py-2.5 text-right font-medium md:table-cell">Última resposta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {forms.map((form) => (
                  <tr key={form.id} className="group hover:bg-zinc-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/app/forms/${form.id}/responses`} className="font-medium text-zinc-900 group-hover:text-brand-700">
                        {form.title}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {form._count.fields} perguntas
                        <span className="sm:hidden"> · {formStatusLabel[form.status]}</span>
                      </p>
                    </td>
                    <td className="hidden px-3 py-3.5 sm:table-cell">
                      <Badge tone={formStatusTone[form.status]}>{formStatusLabel[form.status]}</Badge>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      <span className="font-medium">{form._count.responses}</span>
                      {form.last7Days > 0 && <span className="ml-1.5 text-xs text-emerald-600">+{form.last7Days}</span>}
                    </td>
                    <td className="hidden px-5 py-3.5 text-right text-zinc-500 md:table-cell">
                      {form.lastResponseAt ? formatRelative(form.lastResponseAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
