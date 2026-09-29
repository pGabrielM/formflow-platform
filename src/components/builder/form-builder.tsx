'use client'

import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Copy,
  Gauge,
  Hash,
  Mail,
  Phone,
  Plus,
  Save,
  Star,
  ToggleLeft,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import type { FieldType } from '@prisma/client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { FormRenderer } from '@/components/form/form-renderer'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { saveForm } from '@/lib/actions'
import { FIELD_TYPES, fieldTypeLabel, hasOptions, type FieldDef } from '@/lib/fields'
import { cn } from '@/lib/utils'

const typeIcon: Record<FieldType, typeof Type> = {
  SHORT_TEXT: Type,
  LONG_TEXT: AlignLeft,
  EMAIL: Mail,
  PHONE: Phone,
  NUMBER: Hash,
  DATE: Calendar,
  SINGLE_CHOICE: CircleDot,
  MULTIPLE_CHOICE: CheckSquare,
  DROPDOWN: ChevronDown,
  RATING: Star,
  NPS: Gauge,
  YES_NO: ToggleLeft,
}

type Settings = { title: string; description: string; submitLabel: string; successMessage: string; webhookUrl: string }

function newField(type: FieldType): FieldDef {
  return {
    id: `new_${crypto.randomUUID()}`,
    type,
    label: fieldTypeLabel[type],
    helpText: null,
    required: false,
    options: hasOptions(type) ? ['Opção 1', 'Opção 2'] : [],
  }
}

export function FormBuilder({
  formId,
  initialFields,
  initialSettings,
  hasResponses,
}: {
  formId: string
  initialFields: FieldDef[]
  initialSettings: Settings
  hasResponses: boolean
}) {
  const [fields, setFields] = useState(initialFields)
  const [settings, setSettings] = useState(initialSettings)
  const [selectedId, setSelectedId] = useState<string | null>(initialFields[0]?.id ?? null)
  const [dirty, setDirty] = useState(false)
  const [pending, startTransition] = useTransition()

  const update = (id: string, patch: Partial<FieldDef>) => {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, ...patch } : field)))
    setDirty(true)
  }

  const move = (index: number, delta: number) => {
    setFields((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target]!, next[index]!]
      return next
    })
    setDirty(true)
  }

  const add = (type: FieldType) => {
    const field = newField(type)
    setFields((current) => [...current, field])
    setSelectedId(field.id)
    setDirty(true)
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveForm(formId, {
        ...settings,
        description: settings.description || null,
        webhookUrl: settings.webhookUrl || null,
        fields,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Formulário salvo.')
      setDirty(false)
    })

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="sticky top-14 z-20 -mx-1 flex items-center justify-between gap-3 bg-zinc-50/90 px-1 py-2 backdrop-blur">
          <p className="text-sm text-zinc-500">
            {fields.length} {fields.length === 1 ? 'pergunta' : 'perguntas'}
            {dirty && <span className="ml-2 font-medium text-amber-600">· alterações não salvas</span>}
          </p>
          <Button onClick={save} disabled={pending || !dirty}>
            <Save /> {pending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>

        <div className="glass p-5">
          <Label htmlFor="form-title">Título do formulário</Label>
          <Input
            id="form-title"
            value={settings.title}
            onChange={(event) => {
              setSettings({ ...settings, title: event.target.value })
              setDirty(true)
            }}
            className="text-base font-medium"
          />
          <Label htmlFor="form-description" className="mt-4">
            Descrição
          </Label>
          <Textarea
            id="form-description"
            rows={2}
            value={settings.description}
            onChange={(event) => {
              setSettings({ ...settings, description: event.target.value })
              setDirty(true)
            }}
          />
        </div>

        {hasResponses && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Este formulário já tem respostas. Remover uma pergunta apaga a coluna dela nos relatórios.
          </p>
        )}

        <ol className="space-y-3">
          {fields.map((field, index) => {
            const Icon = typeIcon[field.type]
            const selected = selectedId === field.id
            return (
              <li
                key={field.id}
                className={cn(
                  'rounded-2xl border bg-white/80 shadow-soft transition-colors',
                  selected ? 'border-brand-400 ring-2 ring-brand-500/15' : 'border-zinc-200',
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(selected ? null : field.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">
                      {index + 1}. {field.label || 'Sem título'}
                      {field.required && <span className="text-brand-600"> *</span>}
                    </span>
                    <span className="text-xs text-zinc-500">{fieldTypeLabel[field.type]}</span>
                  </span>
                  <ChevronDown className={cn('size-4 text-zinc-400 transition-transform', selected && 'rotate-180')} />
                </button>

                {selected && (
                  <div className="space-y-4 border-t border-zinc-100 px-4 py-4">
                    <div>
                      <Label htmlFor={`label-${field.id}`}>Pergunta</Label>
                      <Input id={`label-${field.id}`} value={field.label} onChange={(event) => update(field.id, { label: event.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor={`help-${field.id}`}>Texto de ajuda</Label>
                      <Input
                        id={`help-${field.id}`}
                        value={field.helpText ?? ''}
                        placeholder="Opcional"
                        onChange={(event) => update(field.id, { helpText: event.target.value || null })}
                      />
                    </div>
                    {hasOptions(field.type) && (
                      <div>
                        <span className="field-label">Opções</span>
                        <div className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                aria-label={`Opção ${optionIndex + 1}`}
                                onChange={(event) =>
                                  update(field.id, {
                                    options: field.options.map((item, i) => (i === optionIndex ? event.target.value : item)),
                                  })
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Remover opção"
                                disabled={field.options.length <= 2}
                                onClick={() => update(field.id, { options: field.options.filter((_, i) => i !== optionIndex) })}
                              >
                                <X />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => update(field.id, { options: [...field.options, `Opção ${field.options.length + 1}`] })}
                          >
                            <Plus /> Adicionar opção
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                      <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                          type="checkbox"
                          className="size-4 accent-brand-600"
                          checked={field.required}
                          onChange={(event) => update(field.id, { required: event.target.checked })}
                        />
                        Obrigatória
                      </label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" aria-label="Mover para cima" disabled={index === 0} onClick={() => move(index, -1)}>
                          <ArrowUp />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" aria-label="Mover para baixo" disabled={index === fields.length - 1} onClick={() => move(index, 1)}>
                          <ArrowDown />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Duplicar"
                          onClick={() => {
                            const copy = { ...field, id: `new_${crypto.randomUUID()}`, label: `${field.label} (cópia)` }
                            setFields((current) => [...current.slice(0, index + 1), copy, ...current.slice(index + 1)])
                            setSelectedId(copy.id)
                            setDirty(true)
                          }}
                        >
                          <Copy />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir pergunta"
                          className="hover:text-red-600"
                          disabled={fields.length === 1}
                          onClick={() => {
                            setFields((current) => current.filter((item) => item.id !== field.id))
                            setDirty(true)
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-white/60 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-700">Adicionar pergunta</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FIELD_TYPES.map(({ type, label }) => {
              const Icon = typeIcon[type]
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => add(type)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  <Icon className="size-4 shrink-0 text-zinc-400" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <details className="glass p-5">
          <summary className="cursor-pointer text-sm font-medium text-zinc-800">Envio e integrações</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="submitLabel">Texto do botão</Label>
              <Input
                id="submitLabel"
                value={settings.submitLabel}
                onChange={(event) => {
                  setSettings({ ...settings, submitLabel: event.target.value })
                  setDirty(true)
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="successMessage">Mensagem de sucesso</Label>
              <Input
                id="successMessage"
                value={settings.successMessage}
                onChange={(event) => {
                  setSettings({ ...settings, successMessage: event.target.value })
                  setDirty(true)
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="webhookUrl">Webhook (POST a cada resposta)</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.zapier.com/…"
                value={settings.webhookUrl}
                onChange={(event) => {
                  setSettings({ ...settings, webhookUrl: event.target.value })
                  setDirty(true)
                }}
              />
              <p className="mt-1 text-xs text-zinc-500">Envia um JSON com as respostas. Use para CRM, planilhas, Slack, n8n ou Zapier.</p>
            </div>
          </div>
        </details>
      </div>

      <div className="xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] xl:overflow-y-auto">
        <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">Pré-visualização</p>
        <div className="glass p-6 sm:p-8">
          <div className="-mx-6 -mt-6 mb-6 h-1.5 rounded-t-2xl bg-brand-600 sm:-mx-8 sm:-mt-8" />
          <FormRenderer
            title={settings.title || 'Sem título'}
            description={settings.description || null}
            submitLabel={settings.submitLabel || 'Enviar'}
            successMessage={settings.successMessage}
            fields={fields}
          />
        </div>
      </div>
    </div>
  )
}
