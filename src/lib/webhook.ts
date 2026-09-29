import 'server-only'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { prisma } from '@/lib/prisma'

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase()
    return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80') || lower.startsWith('::ffff:127.')
  }
  const [a, b] = address.split('.').map(Number)
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b! >= 16 && b! <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b! >= 64 && b! <= 127)
  )
}

// Webhooks are user-supplied URLs fetched from our server: refuse anything that resolves to a
// private/loopback network so the feature cannot be used to probe internal infrastructure.
export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Use uma URL http(s).')
  if (url.username || url.password) throw new Error('A URL não pode conter credenciais.')
  const allowLocal = process.env.WEBHOOK_ALLOW_PRIVATE === 'true'
  const addresses = isIP(url.hostname) ? [{ address: url.hostname }] : await lookup(url.hostname, { all: true })
  if (!allowLocal && addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('A URL aponta para uma rede privada.')
  }
  return url
}

export async function deliverWebhook(formId: string, url: string, payload: unknown): Promise<{ ok: boolean; status?: number; error?: string }> {
  const started = Date.now()
  let result: { ok: boolean; status?: number; error?: string }
  try {
    const target = await assertPublicUrl(url)
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'FormFlow-Webhook/1.0' },
      body: JSON.stringify(payload),
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    })
    result = { ok: response.ok, status: response.status }
  } catch (error) {
    result = { ok: false, error: error instanceof Error ? error.message : 'Falha desconhecida' }
  }

  await prisma.webhookLog.create({
    data: {
      formId,
      url,
      ok: result.ok,
      statusCode: result.status ?? null,
      error: result.error ?? null,
      durationMs: Date.now() - started,
    },
  })
  return result
}
