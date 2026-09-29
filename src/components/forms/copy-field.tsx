'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyField({ value, multiline = false }: { value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-start gap-2">
      {multiline ? (
        <textarea readOnly value={value} rows={3} className="flex-1 resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-700" />
      ) : (
        <input readOnly value={value} onFocus={(event) => event.target.select()} className="h-9 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 font-mono text-xs text-zinc-700" />
      )}
      <Button variant="secondary" onClick={copy}>
        {copied ? <Check /> : <Copy />}
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  )
}
