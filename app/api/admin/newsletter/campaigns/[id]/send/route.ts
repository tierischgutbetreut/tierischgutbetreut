import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminDbClient } from '@/lib/admin-auth'
import { executeCampaignSend } from '@/lib/newsletter-send'
import type { NewsletterCampaign } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(
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

    const { data: campaign, error } = await adminClient
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Kampagne nicht gefunden' }, { status: 404 })
    }

    if (!['draft', 'scheduled', 'failed'].includes(campaign.status)) {
      return NextResponse.json({ error: 'Kampagne wurde bereits versendet' }, { status: 400 })
    }

    if (!campaign.subject?.trim() || !campaign.html_body?.trim()) {
      return NextResponse.json({ error: 'Betreff und Inhalt sind Pflichtfelder' }, { status: 400 })
    }

    const stats = await executeCampaignSend(adminClient, campaign as NewsletterCampaign)
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
