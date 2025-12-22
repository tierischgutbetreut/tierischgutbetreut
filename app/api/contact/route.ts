import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  vorname?: string
  email: string
  phone: string
  pet?: string
  service: string
  message: string
  availability: string
  privacy: boolean
  // Zusätzliche Felder für Hundepension
  anzahlTiere?: string
  tiernamen?: string
  schulferienBW?: boolean
  konkreterUrlaub?: string
  urlaubVon?: string
  urlaubBis?: string
  intaktKastriert?: string
  alter?: string
  timestamp?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json()

    // Validierung der Pflichtfelder
    if (!formData.name || !formData.email || !formData.message || !formData.availability) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      )
    }

    // Zusätzliche Validierung für Hundepension
    if (formData.service === 'hundepension') {
      if (!formData.vorname || !formData.anzahlTiere || !formData.tiernamen || 
          !formData.alter || !formData.intaktKastriert || !formData.konkreterUrlaub) {
        return NextResponse.json(
          { error: 'Pflichtfelder für Hundepension fehlen' },
          { status: 400 }
        )
      }
      
      // Validierung: Wenn konkreter Urlaub geplant ist, müssen Datumsfelder vorhanden sein
      if (formData.konkreterUrlaub === 'ja') {
        if (!formData.urlaubVon || !formData.urlaubBis) {
          return NextResponse.json(
            { error: 'Bitte geben Sie einen Urlaubszeitraum an' },
            { status: 400 }
          )
        }

        // Parse ISO-Strings zu Date-Objekten (Format: YYYY-MM-DD oder ISO-String)
        const startDate = new Date(formData.urlaubVon)
        const endDate = new Date(formData.urlaubBis)

        // Prüfe ob Datumsfelder gültig sind
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return NextResponse.json(
            { error: 'Ungültiges Datumsformat' },
            { status: 400 }
          )
        }

        // Prüfe ob Enddatum nach Startdatum liegt
        if (endDate < startDate) {
          return NextResponse.json(
            { error: 'Das Enddatum muss nach dem Startdatum liegen' },
            { status: 400 }
          )
        }
      }
    }

    // Webhook URL aus Umgebungsvariablen
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL
    const webhookSecret = process.env.CONTACT_WEBHOOK_SECRET

    if (!webhookUrl) {
      console.error('CONTACT_WEBHOOK_URL ist nicht gesetzt')
      return NextResponse.json(
        { error: 'Webhook-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    // Daten für Webhook vorbereiten
    const webhookData = {
      ...formData,
      timestamp: formData.timestamp || new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unbekannt',
      userAgent: request.headers.get('user-agent') || 'unbekannt',
    }

    // Webhook-Request konfigurieren
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Optional: Webhook Secret hinzufügen
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret
    }

    // Daten an Webhook senden
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookData),
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Webhook-Fehler:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText,
      })
      
      return NextResponse.json(
        { error: 'Fehler beim Senden der Anfrage' },
        { status: 500 }
      )
    }

    console.log('Kontaktanfrage erfolgreich an Webhook gesendet:', {
      service: formData.service,
      name: formData.name,
      email: formData.email,
      timestamp: webhookData.timestamp,
    })

    // Erfolg zurückgeben
    return NextResponse.json(
      { 
        success: true, 
        message: 'Anfrage erfolgreich gesendet'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Fehler beim Verarbeiten der Kontaktanfrage:', error)
    
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    )
  }
} 