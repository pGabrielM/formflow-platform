'use client'

import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { testWebhook } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

export function TestWebhookButton({ formId }: { formId: string }) {
  const { pending, run } = useAction()
  return (
    <Button variant="secondary" size="sm" disabled={pending} onClick={() => run(() => testWebhook(formId), { success: 'Webhook entregue.' })}>
      <Send /> {pending ? 'Enviando…' : 'Enviar teste'}
    </Button>
  )
}
