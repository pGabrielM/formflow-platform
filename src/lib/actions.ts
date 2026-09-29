'use server'

import { randomBytes } from 'node:crypto'
import type { FieldType, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { buildAnswerSchema, FIELD_TYPES, hasOptions, type Answers } from '@/lib/fields'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { TEMPLATES } from '@/lib/templates'
import { slugify } from '@/lib/utils'
import { assertPublicUrl, deliverWebhook } from '@/lib/webhook'

export type ActionResult = { ok: true } | { ok: false; error: string }
const fail = (error: string): ActionResult => ({ ok: false, error })

async function ownedForm(userId: string, formId: string) {
  return prisma.form.findFirst({ where: { id: formId, ownerId: userId } })
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'formulario'
  for (;;) {
    const slug = `${base}-${randomBytes(3).toString('hex')}`
    if (!(await prisma.form.findUnique({ where: { slug } }))) return slug
  }
}

export async function createFormFromTemplate(templateId: string): Promise<ActionResult> {
  const user = await requireUser()
  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES.at(-1)!

  const form = await prisma.form.create({
    data: {
      ownerId: user.id,
      title: template.title,
      description: template.formDescription || null,
      successMessage: template.successMessage,
      slug: await uniqueSlug(template.title),
      fields: {
        create: template.fields.map((field, position) => ({
          type: field.type,
          label: field.label,
          helpText: field.helpText ?? null,
          required: field.required ?? false,
          options: field.options ?? [],
          position,
        })),
      },
    },
  })
  revalidatePath('/app')
  redirect(`/app/forms/${form.id}/edit`)
}

const fieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(FIELD_TYPES.map((item) => item.type) as [FieldType, ...FieldType[]]),
  label: z.string().trim().min(1, 'Toda pergunta precisa de um título.').max(300),
  helpText: z.string().trim().max(300).nullable(),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(120)).max(30),
})

const formSchema = z.object({
  title: z.string().trim().min(2, 'Dê um título ao formulário.').max(160),
  description: z.string().trim().max(2000).nullable(),
  submitLabel: z.string().trim().min(1).max(40),
  successMessage: z.string().trim().min(1).max(500),
  webhookUrl: z.string().trim().max(500).nullable(),
  fields: z.array(fieldSchema).min(1, 'Adicione pelo menos uma pergunta.').max(60),
})

export type FormPayload = z.input<typeof formSchema>

export async function saveForm(formId: string, payload: FormPayload): Promise<ActionResult> {
  const user = await requireUser()
  if (!(await ownedForm(user.id, formId))) return fail('Formulário não encontrado.')
  const parsed = formSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.issues[0]!.message)
  const data = parsed.data

  for (const field of data.fields) {
    if (hasOptions(field.type) && new Set(field.options).size < 2) {
      return fail(`"${field.label}" precisa de pelo menos 2 opções diferentes.`)
    }
  }
  if (data.webhookUrl) {
    try {
      await assertPublicUrl(data.webhookUrl)
    } catch (error) {
      return fail(`Webhook: ${error instanceof Error ? error.message : 'URL inválida.'}`)
    }
  }

  const existing = await prisma.field.findMany({ where: { formId }, select: { id: true } })
  const existingIds = new Set(existing.map((field) => field.id))
  const keptIds = data.fields.filter((field) => existingIds.has(field.id)).map((field) => field.id)

  await prisma.$transaction([
    prisma.form.update({
      where: { id: formId },
      data: {
        title: data.title,
        description: data.description || null,
        submitLabel: data.submitLabel,
        successMessage: data.successMessage,
        webhookUrl: data.webhookUrl || null,
      },
    }),
    prisma.field.deleteMany({ where: { formId, id: { notIn: keptIds } } }),
    ...data.fields.map((field, position) => {
      const values = {
        type: field.type,
        label: field.label,
        helpText: field.helpText || null,
        required: field.required,
        options: hasOptions(field.type) ? field.options : [],
        position,
      }
      // Existing fields keep their id so previously collected answers stay linked to them.
      return existingIds.has(field.id)
        ? prisma.field.update({ where: { id: field.id }, data: values })
        : prisma.field.create({ data: { ...values, formId } })
    }),
  ])

  revalidatePath('/app', 'layout')
  return { ok: true }
}

export async function setFormStatus(formId: string, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'): Promise<ActionResult> {
  const user = await requireUser()
  const updated = await prisma.form.updateMany({ where: { id: formId, ownerId: user.id }, data: { status } })
  if (updated.count === 0) return fail('Formulário não encontrado.')
  revalidatePath('/app', 'layout')
  return { ok: true }
}

export async function duplicateForm(formId: string): Promise<ActionResult> {
  const user = await requireUser()
  const form = await prisma.form.findFirst({ where: { id: formId, ownerId: user.id }, include: { fields: true } })
  if (!form) return fail('Formulário não encontrado.')

  await prisma.form.create({
    data: {
      ownerId: user.id,
      title: `${form.title} (cópia)`,
      description: form.description,
      submitLabel: form.submitLabel,
      successMessage: form.successMessage,
      slug: await uniqueSlug(form.title),
      fields: {
        create: form.fields.map(({ type, label, helpText, required, options, position }) => ({
          type,
          label,
          helpText,
          required,
          options,
          position,
        })),
      },
    },
  })
  revalidatePath('/app')
  return { ok: true }
}

export async function deleteForm(formId: string): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.form.deleteMany({ where: { id: formId, ownerId: user.id } })
  revalidatePath('/app', 'layout')
  redirect('/app')
}

export async function deleteResponse(responseId: string): Promise<ActionResult> {
  const user = await requireUser()
  const deleted = await prisma.response.deleteMany({ where: { id: responseId, form: { ownerId: user.id } } })
  if (deleted.count === 0) return fail('Resposta não encontrada.')
  revalidatePath('/app', 'layout')
  return { ok: true }
}

export async function testWebhook(formId: string): Promise<ActionResult> {
  const user = await requireUser()
  const form = await ownedForm(user.id, formId)
  if (!form?.webhookUrl) return fail('Salve uma URL de webhook primeiro.')
  const result = await deliverWebhook(form.id, form.webhookUrl, {
    event: 'webhook.test',
    form: { id: form.id, title: form.title, slug: form.slug },
    sentAt: new Date().toISOString(),
  })
  revalidatePath(`/app/forms/${formId}/settings`)
  return result.ok ? { ok: true } : fail(`Falhou: ${result.error ?? `HTTP ${result.status}`}`)
}

/* ------------------------------ Public submission ------------------------------ */

export type SubmitState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success' }

export async function submitResponse(slug: string, answers: Answers, honeypot: string): Promise<SubmitState> {
  const form = await prisma.form.findUnique({
    where: { slug },
    include: { fields: { orderBy: { position: 'asc' } } },
  })
  if (!form || form.status !== 'PUBLISHED') {
    return { status: 'error', message: 'Este formulário não está aceitando respostas.' }
  }
  // Bots fill every input, humans never see this one.
  if (honeypot) return { status: 'success' }

  const parsed = buildAnswerSchema(form.fields).safeParse(answers)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      fieldErrors[key] ??= issue.message
    }
    return { status: 'error', message: 'Revise os campos destacados.', fieldErrors }
  }

  const response = await prisma.response.create({
    data: { formId: form.id, answers: parsed.data as Prisma.InputJsonObject },
  })

  if (form.webhookUrl) {
    const webhookUrl = form.webhookUrl
    const payload = {
      event: 'response.created',
      form: { id: form.id, title: form.title, slug: form.slug },
      response: {
        id: response.id,
        createdAt: response.createdAt.toISOString(),
        answers: form.fields.map((field) => ({
          fieldId: field.id,
          label: field.label,
          type: field.type,
          value: parsed.data[field.id] ?? null,
        })),
      },
    }
    // Deliver after the response is sent so a slow endpoint never delays the respondent.
    after(() => deliverWebhook(form.id, webhookUrl, payload))
  }

  return { status: 'success' }
}
