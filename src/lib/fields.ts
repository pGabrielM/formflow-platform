import type { FieldType } from '@prisma/client'
import { z } from 'zod'

export type FieldDef = {
  id: string
  type: FieldType
  label: string
  helpText: string | null
  required: boolean
  options: string[]
}

export const FIELD_TYPES: { type: FieldType; label: string; hasOptions?: boolean }[] = [
  { type: 'SHORT_TEXT', label: 'Texto curto' },
  { type: 'LONG_TEXT', label: 'Texto longo' },
  { type: 'EMAIL', label: 'E-mail' },
  { type: 'PHONE', label: 'Telefone' },
  { type: 'NUMBER', label: 'Número' },
  { type: 'DATE', label: 'Data' },
  { type: 'SINGLE_CHOICE', label: 'Escolha única', hasOptions: true },
  { type: 'MULTIPLE_CHOICE', label: 'Múltipla escolha', hasOptions: true },
  { type: 'DROPDOWN', label: 'Lista suspensa', hasOptions: true },
  { type: 'RATING', label: 'Avaliação (1–5)' },
  { type: 'NPS', label: 'NPS (0–10)' },
  { type: 'YES_NO', label: 'Sim / Não' },
]

export const fieldTypeLabel = Object.fromEntries(FIELD_TYPES.map((item) => [item.type, item.label])) as Record<FieldType, string>

export function hasOptions(type: FieldType): boolean {
  return type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' || type === 'DROPDOWN'
}

export type AnswerValue = string | number | string[] | boolean | null
export type Answers = Record<string, AnswerValue>

// Builds the server-side validator for a form from its field definitions.
// The same rules the browser shows are enforced here, so a crafted request cannot bypass them.
export function buildAnswerSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodType<AnswerValue>> = {}

  for (const field of fields) {
    let schema: z.ZodType<AnswerValue>
    const text = z.string().trim().max(field.type === 'LONG_TEXT' ? 5000 : 500)

    switch (field.type) {
      case 'EMAIL':
        schema = field.required ? z.email('E-mail inválido.') : z.union([z.literal(''), z.email('E-mail inválido.')])
        break
      case 'PHONE':
        schema = field.required
          ? z.string().trim().regex(/^[\d\s()+-]{8,20}$/, 'Telefone inválido.')
          : z.union([z.literal(''), z.string().trim().regex(/^[\d\s()+-]{8,20}$/, 'Telefone inválido.')])
        break
      case 'NUMBER':
        schema = z.preprocess(
          (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
          field.required ? z.number({ error: 'Informe um número.' }).finite() : z.number().finite().nullable(),
        )
        break
      case 'DATE':
        schema = field.required
          ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.')
          : z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.')])
        break
      case 'SINGLE_CHOICE':
      case 'DROPDOWN': {
        const choice = z.enum(field.options as [string, ...string[]], { error: 'Escolha uma opção.' })
        schema = field.required ? choice : z.union([z.literal(''), choice])
        break
      }
      case 'MULTIPLE_CHOICE': {
        const list = z.array(z.enum(field.options as [string, ...string[]]))
        schema = field.required ? list.min(1, 'Escolha pelo menos uma opção.') : list
        break
      }
      case 'RATING':
      case 'NPS': {
        const [min, max] = field.type === 'RATING' ? [1, 5] : [0, 10]
        const score = z.number().int().min(min).max(max)
        schema = z.preprocess(
          (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
          field.required ? score : score.nullable(),
        ) as z.ZodType<AnswerValue>
        break
      }
      case 'YES_NO':
        schema = field.required ? z.enum(['Sim', 'Não'], { error: 'Escolha Sim ou Não.' }) : z.union([z.literal(''), z.enum(['Sim', 'Não'])])
        break
      default:
        schema = field.required ? text.min(1, 'Campo obrigatório.') : text
    }

    if (field.required && (field.type === 'SHORT_TEXT' || field.type === 'LONG_TEXT')) {
      schema = text.min(1, 'Campo obrigatório.')
    }
    // Unanswered optional questions arrive as undefined: normalise them to an empty value.
    const empty = field.type === 'MULTIPLE_CHOICE' ? [] : ['NUMBER', 'RATING', 'NPS'].includes(field.type) ? null : ''
    shape[field.id] = z.preprocess((value) => (value === undefined ? empty : value), schema) as z.ZodType<AnswerValue>
  }

  return z.object(shape)
}

export function formatAnswer(value: AnswerValue | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  return String(value)
}
