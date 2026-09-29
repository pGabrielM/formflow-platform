'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Logo } from '@/components/logo'
import { SidebarNav } from './sidebar-nav'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="rounded-full p-2 text-zinc-700 hover:bg-white lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-zinc-950/40" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-72 bg-zinc-50/95 p-4 shadow-xl backdrop-blur-xl focus:outline-none">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Navegação</DialogPrimitive.Description>
          <div className="mb-6 px-2">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
