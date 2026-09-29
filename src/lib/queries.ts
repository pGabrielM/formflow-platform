import 'server-only'

import { startOfDay, subDays } from 'date-fns'
import type { FieldDef, Answers } from '@/lib/fields'
import { prisma } from '@/lib/prisma'

export async function getForms(userId: string) {
  const forms = await prisma.form.findMany({
    where: { ownerId: userId },
    include: {
      _count: { select: { responses: true, fields: true } },
      responses: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  })
  const since = subDays(new Date(), 7)
  const recent = await prisma.response.groupBy({
    by: ['formId'],
    where: { form: { ownerId: userId }, createdAt: { gte: since } },
    _count: true,
  })
  const recentByForm = new Map(recent.map((row) => [row.formId, row._count]))
  return forms.map((form) => ({
    ...form,
    lastResponseAt: form.responses[0]?.createdAt ?? null,
    last7Days: recentByForm.get(form.id) ?? 0,
  }))
}

export async function getFormForEdit(userId: string, formId: string) {
  return prisma.form.findFirst({
    where: { id: formId, ownerId: userId },
    include: { fields: { orderBy: { position: 'asc' } }, _count: { select: { responses: true } } },
  })
}

export async function getPublicForm(slug: string) {
  return prisma.form.findUnique({
    where: { slug },
    include: { fields: { orderBy: { position: 'asc' } }, owner: { select: { name: true } } },
  })
}

export async function getResponses(userId: string, formId: string) {
  const form = await prisma.form.findFirst({
    where: { id: formId, ownerId: userId },
    include: {
      fields: { orderBy: { position: 'asc' } },
      responses: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!form) return null
  return {
    ...form,
    responses: form.responses.map((response) => ({ ...response, answers: response.answers as Answers })),
  }
}

export async function getWebhookLogs(userId: string, formId: string) {
  return prisma.webhookLog.findMany({
    where: { formId, form: { ownerId: userId } },
    orderBy: { createdAt: 'desc' },
    take: 15,
  })
}

export type FieldSummary =
  | { kind: 'choices'; counts: { option: string; count: number }[]; answered: number }
  | { kind: 'score'; average: number | null; distribution: { score: number; count: number }[]; answered: number; nps?: { score: number; promoters: number; passives: number; detractors: number } }
  | { kind: 'text'; samples: string[]; answered: number }

// Aggregates answers per question for the "Resumo" tab.
export function summarize(fields: FieldDef[], responses: { answers: Answers }[]): Record<string, FieldSummary> {
  const result: Record<string, FieldSummary> = {}

  for (const field of fields) {
    const values = responses
      .map((response) => response.answers[field.id])
      .filter((value) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))

    if (field.type === 'SINGLE_CHOICE' || field.type === 'DROPDOWN' || field.type === 'MULTIPLE_CHOICE' || field.type === 'YES_NO') {
      const options = field.type === 'YES_NO' ? ['Sim', 'Não'] : field.options
      const counts = options.map((option) => ({
        option,
        count: values.filter((value) => (Array.isArray(value) ? value.includes(option) : value === option)).length,
      }))
      result[field.id] = { kind: 'choices', counts, answered: values.length }
    } else if (field.type === 'RATING' || field.type === 'NPS') {
      const numbers = values.map(Number).filter((value) => Number.isFinite(value))
      const [min, max] = field.type === 'RATING' ? [1, 5] : [0, 10]
      const distribution = Array.from({ length: max - min + 1 }, (_, index) => ({
        score: min + index,
        count: numbers.filter((value) => value === min + index).length,
      }))
      const average = numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null
      let nps
      if (field.type === 'NPS' && numbers.length) {
        const promoters = numbers.filter((value) => value >= 9).length
        const detractors = numbers.filter((value) => value <= 6).length
        nps = {
          score: Math.round(((promoters - detractors) / numbers.length) * 100),
          promoters,
          detractors,
          passives: numbers.length - promoters - detractors,
        }
      }
      result[field.id] = { kind: 'score', average, distribution, answered: numbers.length, nps }
    } else {
      result[field.id] = { kind: 'text', samples: values.slice(0, 5).map(String), answered: values.length }
    }
  }
  return result
}

export function responsesPerDay(responses: { createdAt: Date }[], days = 30) {
  const now = new Date()
  return Array.from({ length: days }, (_, index) => {
    const day = startOfDay(subDays(now, days - 1 - index))
    const next = day.getTime() + 86400000
    return {
      day,
      count: responses.filter((response) => response.createdAt.getTime() >= day.getTime() && response.createdAt.getTime() < next).length,
    }
  })
}
