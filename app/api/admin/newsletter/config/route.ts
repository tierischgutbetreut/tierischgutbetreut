import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  return NextResponse.json({
    from: process.env.SMTP_FROM || 'info@tierischgutbetreut.de',
    testEmail: process.env.NEWSLETTER_TEST_EMAIL || 'dev@tigube.de',
    aiEnabled: Boolean(process.env.OPENAI_API_KEY),
  })
}
