'use client'

import { CheckCircle2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import type { AnswerValue, Answers, FieldDef } from '@/lib/fields'
import type { SubmitState } from '@/lib/actions'
import { FieldInput } from './field-input'

type Props = {
  title: string
  description: string | null
  submitLabel: string
  successMessage: string
  fields: FieldDef[]
  onSubmit?: (answers: Answers, honeypot: string) => Promise<SubmitState>
}

export function FormRenderer({ title, description, submitLabel, successMessage, fields, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Answers>({})
  const [state, setState] = useState<SubmitState>({ status: 'idle' })
  const [honeypot, setHoneypot] = useState('')
  const [pending, startTransition] = useTransition()

  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}

  if (state.status === 'success') {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <p className="mt-4 text-lg font-medium text-zinc-900">{successMessage}</p>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-brand-700 hover:underline"
          onClick={() => {
            setAnswers({})
            setState({ status: 'idle' })
          }}
        >
          Enviar outra resposta
        </button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!onSubmit) return
        startTransition(async () => {
          const result = await onSubmit(answers, honeypot)
          setState(result)
          if (result.status === 'error' && result.fieldErrors) {
            const first = Object.keys(result.fieldErrors)[0]
            document.getElementById(`block-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
      }}
    >
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
      {description && <p className="mt-2 whitespace-pre-line text-zinc-600">{description}</p>}

      <div className="mt-8 space-y-7">
        {fields.map((field, index) => (
          <div key={field.id} id={`block-${field.id}`}>
            <label id={`field-${field.id}-label`} htmlFor={`field-${field.id}`} className="block text-sm font-medium text-zinc-900">
              <span className="mr-1.5 text-zinc-400">{index + 1}.</span>
              {field.label}
              {field.required && <span className="ml-0.5 text-brand-600">*</span>}
            </label>
            {field.helpText && <p className="mt-0.5 text-xs text-zinc-500">{field.helpText}</p>}
            <div className="mt-2.5">
              <FieldInput
                field={field}
                value={answers[field.id]}
                invalid={!!fieldErrors[field.id]}
                onChange={(value: AnswerValue) => setAnswers((current) => ({ ...current, [field.id]: value }))}
              />
            </div>
            {fieldErrors[field.id] && <p className="field-error">{fieldErrors[field.id]}</p>}
          </div>
        ))}
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        name="website"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
      />

      {state.status === 'error' && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-8 w-full sm:w-auto" disabled={pending || !onSubmit}>
        {pending ? 'Enviando…' : submitLabel}
      </Button>
      {!onSubmit && <p className="mt-2 text-xs text-zinc-400">Pré-visualização — o envio fica desativado aqui.</p>}
    </form>
  )
}
