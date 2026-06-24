import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY ist nicht konfiguriert. AI-Entwürfe sind deaktiviert.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const topic = String(body.topic || 'Allgemeine Service-Mitteilung')
    const audience = String(body.audience || 'Kunden von tierisch gut betreut')
    const prompt = String(body.prompt || '')

    const systemPrompt = `Du schreibst transaktionale Service-E-Mails für tierisch gut betreut GmbH, einen Tierbetreuungsservice in Deutschland.
Es handelt sich um sachliche Mitteilungen (z. B. Buchungsbestätigung, Terminerinnerung, fehlende Unterlagen) — kein Marketing-Newsletter.
Antworte ausschließlich als JSON mit den Feldern: subject, preview_text, html_body.
html_body soll einfaches HTML sein (p, strong, ul, li, a). Ton: freundlich, professionell, auf Deutsch.`

    const userPrompt = `Thema: ${topic}
Zielgruppe: ${audience}
${prompt ? `Zusätzliche Anweisung: ${prompt}` : ''}

Erstelle einen Entwurf für eine transaktionale E-Mail.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `AI-Anfrage fehlgeschlagen: ${err}` }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Keine AI-Antwort erhalten' }, { status: 502 })
    }

    const draft = JSON.parse(content)
    return NextResponse.json({ draft })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
