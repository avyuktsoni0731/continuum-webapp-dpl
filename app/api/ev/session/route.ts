import { NextRequest, NextResponse } from 'next/server'
import { resolveVerceraCheckoutSession } from '@/lib/ev-checkout-session'

export async function GET(request: NextRequest) {
  try {
    const checkoutId = request.cookies.get('ev_checkout_id')?.value?.trim()
    if (!checkoutId) {
      return NextResponse.json({ error: 'Checkout session missing' }, { status: 400 })
    }
    const session = await resolveVerceraCheckoutSession(checkoutId)
    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load checkout session' },
      { status: 400 }
    )
  }
}

