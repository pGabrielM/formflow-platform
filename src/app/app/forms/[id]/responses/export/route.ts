import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { formatAnswer } from '@/lib/fields'
import { formatDate } from '@/lib/format'
import { getResponses } from '@/lib/queries'
import { slugify } from '@/lib/utils'

function cell(value: string): string {
  // Also neutralises spreadsheet formula injection (=, +, -, @).
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const form = await getResponses(session.user.id, (await params).id)
  if (!form) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const header = ['Enviada em', ...form.fields.map((field) => field.label)]
  const rows = form.responses.map((response) => [
    formatDate(response.createdAt, 'dd/MM/yyyy HH:mm'),
    ...form.fields.map((field) => formatAnswer(response.answers[field.id])),
  ])
  const csv = '﻿' + [header, ...rows].map((row) => row.map(cell).join(';')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slugify(form.title) || 'respostas'}.csv"`,
    },
  })
}
