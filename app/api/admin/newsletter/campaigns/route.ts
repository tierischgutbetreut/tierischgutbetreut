import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminDbClient } from '@/lib/admin-auth'
import type { NewsletterRecipientConfig } from '@/lib/types'

export const runtime = 'nodejs'

function parseRecipientConfig(body: Record<string, unknown>): NewsletterRecipientConfig {
  const config = body.recipient_config as NewsletterRecipientConfig | undefined
  return {
    groups: Array.isArray(config?.groups) ? config.groups.map(String) : [],
    contactIds: Array.isArray(config?.contactIds) ? config.contactIds.map(String) : [],
  }
}

function campaignPayload(body: Record<string, unknown>, userId?: string) {
  return {
    subject: String(body.subject || ''),
    preview_text: body.preview_text ? String(body.preview_text) : null,
    html_body: String(body.html_body || ''),
    plain_text: body.plain_text ? String(body.plain_text) : null,
    from_address: body.from_address ? String(body.from_address) : process.env.SMTP_FROM || null,
    reply_to: body.reply_to ? String(body.reply_to) : null,
    topic_id: body.topic_id ? String(body.topic_id) : null,
    recipient_config: parseRecipientConfig(body),
    status: body.status ? String(body.status) : 'draft',
    scheduled_at: body.scheduled_at ? String(body.scheduled_at) : null,
    created_by: userId || null,
    updated_at: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const adminClient = getAdminDbClient()
    const { data, error } = await adminClient
      .from('newsletter_campaigns')
      .select('*, topic:newsletter_topics(*)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaigns: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const adminClient = getAdminDbClient()
    const payload = campaignPayload(body, auth.user.id)

    const { data, error } = await adminClient
      .from('newsletter_campaigns')
      .insert(payload)
      .select('*, topic:newsletter_topics(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
