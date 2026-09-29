'use client'

import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { Copy, ExternalLink, Lock, MoreHorizontal, Rocket, Trash2, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { deleteForm, duplicateForm, setFormStatus } from '@/lib/actions'
import { useAction } from '@/lib/use-action'

const item =
  'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-700 outline-none data-[highlighted]:bg-zinc-100'

export function FormActions({ formId, slug, status }: { formId: string; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' }) {
  const { pending, run } = useAction()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex items-center gap-2">
      {status === 'PUBLISHED' ? (
        <Button asChild variant="secondary">
          <a href={`/f/${slug}`} target="_blank" rel="noreferrer">
            <ExternalLink /> Abrir formulário
          </a>
        </Button>
      ) : (
        <Button disabled={pending} onClick={() => run(() => setFormStatus(formId, 'PUBLISHED'), { success: 'Formulário publicado!' })}>
          <Rocket /> Publicar
        </Button>
      )}
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <Button variant="secondary" size="icon" aria-label="Mais ações">
            <MoreHorizontal />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={6} className="z-50 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
            {status === 'PUBLISHED' && (
              <Dropdown.Item className={item} onSelect={() => run(() => setFormStatus(formId, 'CLOSED'), { success: 'Respostas encerradas.' })}>
                <Lock className="size-4" /> Encerrar respostas
              </Dropdown.Item>
            )}
            {status !== 'DRAFT' && (
              <Dropdown.Item className={item} onSelect={() => run(() => setFormStatus(formId, 'DRAFT'), { success: 'Voltou para rascunho.' })}>
                <Undo2 className="size-4" /> Voltar para rascunho
              </Dropdown.Item>
            )}
            <Dropdown.Item className={item} onSelect={() => run(() => duplicateForm(formId), { success: 'Cópia criada.' })}>
              <Copy className="size-4" /> Duplicar
            </Dropdown.Item>
            <Dropdown.Separator className="my-1 h-px bg-zinc-100" />
            <Dropdown.Item className={`${item} text-red-600`} onSelect={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Excluir
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent title="Excluir formulário?" description="Todas as respostas coletadas também serão apagadas.">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={pending} onClick={() => run(() => deleteForm(formId))}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
