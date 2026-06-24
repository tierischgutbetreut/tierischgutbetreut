import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sendCampaignTestEmail } from '@/lib/newsletter-send'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const testEmail = body.testEmail || process.env.NEWSLETTER_TEST_EMAIL || auth.user.email

    const result = await sendCampaignTestEmail(
      {
        subject: String(body.subject || 'Test: Transaktionale E-Mail'),
        preview_text: body.preview_text || null,
        html_body: String(body.html_body || '<p>Test</p>'),
        plain_text: body.plain_text || null,
        reply_to: body.reply_to || null,
      },
      testEmail
    )

    if (result.status === 'failed') {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({ success: true, to: testEmail })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
