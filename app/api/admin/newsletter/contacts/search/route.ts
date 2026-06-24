import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminDbClient } from '@/lib/admin-auth'
import { formatContactLabel } from '@/lib/newsletter-groups'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const q = request.nextUrl.searchParams.get('q')?.trim() || ''
    const adminClient = getAdminDbClient()

    let query = adminClient
      .from('contacts')
      .select('id, email, vorname, nachname, contact_type, status')
      .not('email', 'is', null)
      .is('newsletter_unsubscribed_at', null)
      .limit(20)

    if (q) {
      query = query.or(`email.ilike.%${q}%,vorname.ilike.%${q}%,nachname.ilike.%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      contacts: (data || []).map((c) => ({
        id: c.id,
        email: c.email,
        label: formatContactLabel(c),
        contact_type: c.contact_type,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
