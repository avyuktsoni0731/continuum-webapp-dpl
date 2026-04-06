import { NextRequest, NextResponse } from 'next/server'

/**
 * Accepts POST from Vercera with hidden checkoutId (form post).
 * Sets HttpOnly cookie and redirects to the UI page at /ev/checkout.
 * Lives under /api so it does not conflict with app/ev/checkout/page.tsx.
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  let checkoutId = ''
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    checkoutId = String(form.get('checkoutId') || '')
  } else {
    const body = (await request.json().catch(() => ({}))) as { checkoutId?: string }
    checkoutId = body.checkoutId || ''
  }

  checkoutId = checkoutId.trim()
  if (!checkoutId) {
    return NextResponse.json({ error: 'checkoutId required' }, { status: 400 })
  }

  const redirectUrl = new URL('/ev/checkout', request.url)
  const response = NextResponse.redirect(redirectUrl, { status: 303 })
  response.cookies.set('ev_checkout_id', checkoutId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  })
  return response
}
