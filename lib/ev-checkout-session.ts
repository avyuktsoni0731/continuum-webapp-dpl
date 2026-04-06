export type EvCheckoutSession = {
  checkoutId: string
  userId: string
  email: string | null
  userName: string | null
  eventId: string | null
  bundleId: string | null
  eventName: string
  amountInr: number
  returnUrl: string
  additionalInfo: string | null
  expiresAtMs: number
}

export async function resolveVerceraCheckoutSession(checkoutId: string): Promise<EvCheckoutSession> {
  const resolveUrl = process.env.VERCERA_SESSION_RESOLVE_URL
  const secret = process.env.VERCERA_SESSION_SHARED_SECRET
  if (!resolveUrl || !secret) {
    throw new Error('Session resolver is not configured')
  }

  const res = await fetch(resolveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-EV-Session-Secret': secret,
    },
    body: JSON.stringify({ checkoutId }),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Failed to resolve checkout session')
  }
  return data as EvCheckoutSession
}

