import { NextRequest, NextResponse } from 'next/server'
import { getAdminDbClient } from '@/lib/admin-auth'
import { executeCampaignSend } from '@/lib/newsletter-send'
import type { NewsletterCampaign } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const adminClient = getAdminDbClient()
    const now = new Date().toISOString()

    const { data: campaigns, error } = await adminClient
      .from('newsletter_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = []

    for (const campaign of campaigns || []) {
      const stats = await executeCampaignSend(adminClient, campaign as NewsletterCampaign)
      results.push({ id: campaign.id, stats })
    }

    return NextResponse.json({ processed: results.length, results })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
