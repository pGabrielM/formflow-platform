import { AlertCircle, CheckCircle2, Webhook } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CopyField } from '@/components/forms/copy-field'
import { TestWebhookButton } from '@/components/forms/test-webhook-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { getWebhookLogs } from '@/lib/queries'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Compartilhar' }

async function baseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  const h = await headers()
  return `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const form = await prisma.form.findFirst({ where: { id, ownerId: user.id } })
  if (!form) notFound()
  const logs = await getWebhookLogs(user.id, form.id)
  const url = `${await baseUrl()}/f/${form.slug}`
  const embed = `<iframe src="${url}?embed=1" width="100%" height="720" style="border:0;border-radius:12px" title="${form.title.replace(/"/g, '')}"></iframe>`

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        {form.status !== 'PUBLISHED' && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertCircle className="size-4 shrink-0" />
            {form.status === 'DRAFT' ? 'Publique o formulário para o link começar a funcionar.' : 'O formulário está encerrado e não recebe novas respostas.'}
          </p>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Link público</CardTitle>
            <CardDescription>Envie por WhatsApp, e-mail ou coloque na bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <CopyField value={url} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incorporar no site</CardTitle>
            <CardDescription>Cole este código em qualquer página HTML, WordPress ou Wix.</CardDescription>
          </CardHeader>
          <CardContent>
            <CopyField value={embed} multiline />
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="size-4 text-brand-600" /> Webhook
            </CardTitle>
            <CardDescription className="mt-1 break-all">
              {form.webhookUrl ?? (
                <>
                  Nenhum configurado.{' '}
                  <Link href={`/app/forms/${form.id}/edit`} className="font-medium text-brand-700 hover:underline">
                    Configurar em Editar → Envio e integrações
                  </Link>
                </>
              )}
            </CardDescription>
          </div>
          {form.webhookUrl && <TestWebhookButton formId={form.id} />}
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhuma entrega registrada.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center gap-3 py-2">
                  {log.ok ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" /> : <AlertCircle className="size-4 shrink-0 text-red-500" />}
                  <span className="font-mono text-xs text-zinc-600">{log.statusCode ?? 'erro'}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">{log.error ?? `${log.durationMs} ms`}</span>
                  <span className="shrink-0 text-xs text-zinc-400">{formatDate(log.createdAt, 'dd/MM HH:mm')}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
