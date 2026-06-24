import { NextRequest, NextResponse } from 'next/server'
import { getAdminDbClient } from '@/lib/admin-auth'
import { verifyUnsubscribeToken } from '@/lib/newsletter-unsubscribe'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token fehlt' }, { status: 400 })
  }

  const contactId = verifyUnsubscribeToken(token)
  if (!contactId) {
    return NextResponse.json({ error: 'Ungültiger oder abgelaufener Link' }, { status: 400 })
  }

  try {
    const adminClient = getAdminDbClient()
    const { error } = await adminClient
      .from('contacts')
      .update({ newsletter_unsubscribed_at: new Date().toISOString() })
      .eq('id', contactId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
