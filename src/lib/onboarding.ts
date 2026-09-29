import 'server-only'

import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { TEMPLATES } from '@/lib/templates'

// New accounts start with a ready-to-publish form instead of an empty list.
export async function onUserCreated(userId: string): Promise<void> {
  const template = TEMPLATES.find((item) => item.id === 'nps')!
  await prisma.form.create({
    data: {
      ownerId: userId,
      title: template.title,
      description: template.formDescription,
      successMessage: template.successMessage,
      slug: `satisfacao-${randomBytes(3).toString('hex')}`,
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
}
