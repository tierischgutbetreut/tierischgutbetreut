import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminDbClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const adminClient = getAdminDbClient()
    const { data, error } = await adminClient
      .from('newsletter_campaigns')
      .select('*, topic:newsletter_topics(*)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const { data: logs } = await adminClient
      .from('newsletter_send_logs')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })
      .limit(100)

    return NextResponse.json({ campaign: data, logs: logs || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const adminClient = getAdminDbClient()

    const { data: existing } = await adminClient
      .from('newsletter_campaigns')
      .select('status')
      .eq('id', id)
      .single()

    if (!existing || !['draft', 'scheduled'].includes(existing.status)) {
      return NextResponse.json({ error: 'Kampagne kann nicht mehr bearbeitet werden' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.subject !== undefined) updates.subject = String(body.subject)
    if (body.preview_text !== undefined) updates.preview_text = body.preview_text ? String(body.preview_text) : null
    if (body.html_body !== undefined) updates.html_body = String(body.html_body)
    if (body.plain_text !== undefined) updates.plain_text = body.plain_text ? String(body.plain_text) : null
    if (body.reply_to !== undefined) updates.reply_to = body.reply_to ? String(body.reply_to) : null
    if (body.topic_id !== undefined) updates.topic_id = body.topic_id ? String(body.topic_id) : null
    if (body.recipient_config !== undefined) updates.recipient_config = body.recipient_config
    if (body.scheduled_at !== undefined) {
      updates.scheduled_at = body.scheduled_at ? String(body.scheduled_at) : null
      updates.status = body.scheduled_at ? 'scheduled' : 'draft'
    }

    const { data, error } = await adminClient
      .from('newsletter_campaigns')
      .update(updates)
      .eq('id', id)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const adminClient = getAdminDbClient()
    const { error } = await adminClient.from('newsletter_campaigns').delete().eq('id', id)

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
