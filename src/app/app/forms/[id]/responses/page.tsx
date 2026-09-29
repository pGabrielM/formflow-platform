import { Download, Inbox, Share2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmButton } from '@/components/confirm-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { deleteResponse } from '@/lib/actions'
import { fieldTypeLabel, formatAnswer } from '@/lib/fields'
import { formatDate } from '@/lib/format'
import { getResponses, responsesPerDay, summarize, type FieldSummary } from '@/lib/queries'
import { requireUser } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Respostas' }

function Bar({ label, count, total, highlight }: { label: string; count: number; total: number; highlight?: boolean }) {
  const percent = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="truncate text-zinc-700">{label}</span>
        <span className="shrink-0 text-zinc-500 tabular-nums">
          {count} · {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className={cn('h-full rounded-full', highlight ? 'bg-brand-600' : 'bg-brand-400')} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function SummaryBody({ summary }: { summary: FieldSummary }) {
  if (summary.answered === 0) return <p className="text-sm text-zinc-400">Sem respostas ainda.</p>

  if (summary.kind === 'choices') {
    const max = Math.max(...summary.counts.map((item) => item.count))
    return (
      <div className="space-y-3">
        {summary.counts.map((item) => (
          <Bar key={item.option} label={item.option} count={item.count} total={summary.answered} highlight={item.count === max && max > 0} />
        ))}
      </div>
    )
  }

  if (summary.kind === 'score') {
    const max = Math.max(1, ...summary.distribution.map((item) => item.count))
    return (
      <div>
        <div className="mb-4 flex flex-wrap gap-6">
          {summary.nps && (
            <div>
              <p className={cn('text-3xl font-semibold tabular-nums', summary.nps.score >= 50 ? 'text-emerald-600' : summary.nps.score >= 0 ? 'text-amber-600' : 'text-red-600')}>
                {summary.nps.score}
              </p>
              <p className="text-xs text-zinc-500">NPS</p>
            </div>
          )}
          <div>
            <p className="text-3xl font-semibold tabular-nums">{summary.average?.toFixed(1)}</p>
            <p className="text-xs text-zinc-500">Média</p>
          </div>
          {summary.nps && (
            <div className="flex gap-4 text-sm">
              <span><strong className="text-emerald-600">{summary.nps.promoters}</strong> promotores</span>
              <span><strong className="text-zinc-600">{summary.nps.passives}</strong> neutros</span>
              <span><strong className="text-red-600">{summary.nps.detractors}</strong> detratores</span>
            </div>
          )}
        </div>
        <div className="flex h-28 items-end gap-1">
          {summary.distribution.map((item) => (
            <div key={item.score} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] text-zinc-500 tabular-nums">{item.count || ''}</span>
              <div className="w-full rounded-t bg-brand-500" style={{ height: `${(item.count / max) * 80}%`, minHeight: item.count ? 4 : 2, opacity: item.count ? 1 : 0.15 }} />
              <span className="text-xs text-zinc-500">{item.score}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {summary.samples.map((sample, index) => (
        <li key={index} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
          {sample}
        </li>
      ))}
      {summary.answered > summary.samples.length && (
        <li className="text-xs text-zinc-400">+ {summary.answered - summary.samples.length} respostas na aba Individuais</li>
      )}
    </ul>
  )
}

export default async function ResponsesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const view = (await searchParams).view === 'table' ? 'table' : 'summary'
  const form = await getResponses(user.id, id)
  if (!form) notFound()

  if (form.responses.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nenhuma resposta ainda"
        description={form.status === 'PUBLISHED' ? 'Compartilhe o link para começar a receber respostas.' : 'Publique o formulário e compartilhe o link.'}
        action={
          <Button asChild variant="secondary">
            <Link href={`/app/forms/${form.id}/share`}>
              <Share2 /> Compartilhar
            </Link>
          </Button>
        }
      />
    )
  }

  const summaries = summarize(form.fields, form.responses)
  const perDay = responsesPerDay(form.responses)
  const maxDay = Math.max(1, ...perDay.map((day) => day.count))

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-white bg-white/80 p-1 shadow-soft">
          {[
            ['summary', 'Resumo'],
            ['table', 'Individuais'],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={`?view=${key}`}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium', view === key ? 'bg-brand-600 text-white' : 'text-zinc-600 hover:bg-zinc-100')}
            >
              {label}
            </Link>
          ))}
        </div>
        <Button asChild variant="secondary">
          <a href={`/app/forms/${form.id}/responses/export`}>
            <Download /> Exportar CSV
          </a>
        </Button>
      </div>

      {view === 'summary' ? (
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-end justify-between">
              <div>
                <CardTitle>Respostas nos últimos 30 dias</CardTitle>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{form.responses.length} no total</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-24 items-end gap-1">
                {perDay.map((day) => (
                  <div
                    key={day.day.toISOString()}
                    title={`${formatDate(day.day, 'dd/MM')}: ${day.count}`}
                    className={cn('flex-1 rounded-t-sm', day.count ? 'bg-brand-500' : 'bg-zinc-100')}
                    style={{ height: `${Math.max(4, (day.count / maxDay) * 100)}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            {form.fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <p className="text-xs text-zinc-400">
                    {index + 1}. {fieldTypeLabel[field.type]} · {summaries[field.id]!.answered} respostas
                  </p>
                  <CardTitle className="text-base">{field.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SummaryBody summary={summaries[field.id]!} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="sticky left-0 bg-zinc-50 px-4 py-2.5 font-medium whitespace-nowrap">Enviada em</th>
                {form.fields.map((field) => (
                  <th key={field.id} className="max-w-56 min-w-40 px-3 py-2.5 font-medium">
                    <span className="line-clamp-2">{field.label}</span>
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {form.responses.map((response) => (
                <tr key={response.id} className="align-top hover:bg-zinc-50">
                  <td className="sticky left-0 bg-white px-4 py-2.5 whitespace-nowrap text-zinc-500">{formatDate(response.createdAt, 'dd/MM HH:mm')}</td>
                  {form.fields.map((field) => (
                    <td key={field.id} className="max-w-72 px-3 py-2.5 text-zinc-800">
                      <span className="line-clamp-3">{formatAnswer(response.answers[field.id]) || <span className="text-zinc-300">—</span>}</span>
                    </td>
                  ))}
                  <td className="pr-2">
                    <ConfirmButton
                      compact
                      title="Excluir resposta?"
                      description="Essa resposta será removida dos relatórios."
                      action={deleteResponse.bind(null, response.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
