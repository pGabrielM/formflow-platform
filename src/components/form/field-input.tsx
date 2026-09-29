'use client'

import { Star } from 'lucide-react'
import type { AnswerValue, FieldDef } from '@/lib/fields'
import { Input, Select, Textarea } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = {
  field: FieldDef
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
  invalid?: boolean
}

const choiceClass = (active: boolean) =>
  cn(
    'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
    active ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-zinc-200 bg-white hover:border-zinc-300',
  )

export function FieldInput({ field, value, onChange, invalid }: Props) {
  const id = `field-${field.id}`
  const common = { id, 'aria-invalid': invalid || undefined, className: invalid ? 'border-red-400' : undefined }

  switch (field.type) {
    case 'LONG_TEXT':
      return <Textarea {...common} rows={4} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
    case 'EMAIL':
      return <Input {...common} type="email" autoComplete="email" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder="nome@exemplo.com" />
    case 'PHONE':
      return <Input {...common} type="tel" autoComplete="tel" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder="(00) 00000-0000" />
    case 'NUMBER':
      return <Input {...common} type="number" inputMode="decimal" value={value === null || value === undefined ? '' : String(value)} onChange={(event) => onChange(event.target.value)} />
    case 'DATE':
      return <Input {...common} type="date" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className={cn('max-w-52', common.className)} />
    case 'DROPDOWN':
      return (
        <Select {...common} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}>
          <option value="">Selecione…</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      )
    case 'SINGLE_CHOICE':
    case 'YES_NO': {
      const options = field.type === 'YES_NO' ? ['Sim', 'Não'] : field.options
      return (
        <div role="radiogroup" aria-labelledby={`${id}-label`} className={cn('grid gap-2', field.type === 'YES_NO' && 'grid-cols-2 sm:max-w-xs')}>
          {options.map((option) => (
            <label key={option} className={choiceClass(value === option)}>
              <input type="radio" name={id} className="accent-brand-600" checked={value === option} onChange={() => onChange(option)} />
              {option}
            </label>
          ))}
        </div>
      )
    }
    case 'MULTIPLE_CHOICE': {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="grid gap-2" aria-labelledby={`${id}-label`}>
          {field.options.map((option) => {
            const active = selected.includes(option)
            return (
              <label key={option} className={choiceClass(active)}>
                <input
                  type="checkbox"
                  className="accent-brand-600"
                  checked={active}
                  onChange={() => onChange(active ? selected.filter((item) => item !== option) : [...selected, option])}
                />
                {option}
              </label>
            )
          })}
        </div>
      )
    }
    case 'RATING':
      return (
        <div className="flex gap-1" role="radiogroup" aria-labelledby={`${id}-label`}>
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={value === score}
              aria-label={`${score} de 5`}
              onClick={() => onChange(score)}
              className="rounded p-0.5 transition-transform hover:scale-110"
            >
              <Star className={cn('size-8', Number(value) >= score ? 'fill-amber-400 text-amber-400' : 'text-zinc-300')} />
            </button>
          ))}
        </div>
      )
    case 'NPS':
      return (
        <div>
          <div className="grid grid-cols-11 gap-1" role="radiogroup" aria-labelledby={`${id}-label`}>
            {Array.from({ length: 11 }, (_, score) => (
              <button
                key={score}
                type="button"
                role="radio"
                aria-checked={value === score}
                onClick={() => onChange(score)}
                className={cn(
                  'h-10 rounded-md border text-sm font-medium transition-colors',
                  value === score ? 'border-brand-600 bg-brand-600 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-brand-300',
                )}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
            <span>Nada provável</span>
            <span>Muito provável</span>
          </div>
        </div>
      )
    default:
      return <Input {...common} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
  }
}
