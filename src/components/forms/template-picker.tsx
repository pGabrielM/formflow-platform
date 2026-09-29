'use client'

import { ArrowRight } from 'lucide-react'
import { useTransition } from 'react'
import { createFormFromTemplate } from '@/lib/actions'
import type { FormTemplate } from '@/lib/templates'

export function TemplatePicker({ templates }: { templates: Pick<FormTemplate, 'id' | 'name' | 'description' | 'fields'>[] }) {
  const [pending, startTransition] = useTransition()
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {templates.map((template) => (
        <button
          key={template.id}
          disabled={pending}
          onClick={() => startTransition(() => createFormFromTemplate(template.id).then(() => undefined))}
          className="group flex flex-col glass p-6 text-left transition hover:-translate-y-1 hover:border-brand-200 disabled:opacity-60"
        >
          <span className="font-semibold text-zinc-900">{template.name}</span>
          <span className="mt-1 flex-1 text-sm text-zinc-500">{template.description}</span>
          <span className="mt-4 flex items-center justify-between text-xs text-zinc-400">
            {template.fields.length} {template.fields.length === 1 ? 'pergunta' : 'perguntas'}
            <ArrowRight className="size-4 text-brand-600 opacity-0 transition group-hover:opacity-100" />
          </span>
        </button>
      ))}
    </div>
  )
}
