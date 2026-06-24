import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminDbClient } from '@/lib/admin-auth'
import { resolveNewsletterRecipients } from '@/lib/newsletter-groups'
import type { NewsletterRecipientConfig } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const config: NewsletterRecipientConfig = {
      groups: Array.isArray(body.groups) ? body.groups.map(String) : [],
      contactIds: Array.isArray(body.contactIds) ? body.contactIds.map(String) : [],
    }

    const adminClient = getAdminDbClient()
    const recipients = await resolveNewsletterRecipients(adminClient, config)

    return NextResponse.json({
      count: recipients.length,
      warnLargeList: recipients.length > 200,
      recipients: recipients.slice(0, 50).map((r) => ({
        id: r.id,
        email: r.email,
        name: [r.vorname, r.nachname].filter(Boolean).join(' '),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
