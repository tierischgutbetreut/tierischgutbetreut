// E-Mail-Versand Utility
// Für echten E-Mail-Versand kann Resend (kostenlos bis 3000/Monat) verwendet werden:
// npm install resend

interface EmailData {
  name: string
  email: string
  phone: string
  animal: string
  service: string
  message: string
  availability: string
  animalType: string
  subject: string
  timestamp: string
}

export async function sendContactEmail(formData: EmailData) {
  // Option 1: Mit Resend (empfohlen) - nach Installation von 'resend' Package verfügbar
  if (process.env.RESEND_API_KEY) {
    try {
      // Dynamischer Import - Resend Package muss separat installiert werden
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resendModule = await import('resend' as any).catch(() => null)
      if (!resendModule) {
        console.log('Resend nicht installiert - fallback zu Konsole')
        throw new Error('Resend nicht verfügbar')
      }
      const { Resend } = resendModule
      const resend = new Resend(process.env.RESEND_API_KEY)

      const emailHtml = `
        <h2>Neue Anfrage - ${formData.animalType}</h2>
        
        <h3>Kontaktdaten:</h3>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>E-Mail:</strong> ${formData.email}</p>
        <p><strong>Telefon:</strong> ${formData.phone}</p>
        
        <h3>Tier-Information:</h3>
        <p><strong>Tier:</strong> ${formData.animal}</p>
        <p><strong>Gewünschte Leistung:</strong> ${formData.service}</p>
        
        <h3>Verfügbarkeit:</h3>
        <p>${formData.availability}</p>
        
        <h3>Nachricht:</h3>
        <p>${formData.message}</p>
        
        <hr>
        <p><small>Gesendet am: ${new Date(formData.timestamp).toLocaleString('de-DE')}</small></p>
      `

      const result = await resend.emails.send({
        from: 'website@tierischgutbetreut.de', // Muss von Ihrer Domain sein
        to: ['info@tierischgutbetreut.de'],
        subject: formData.subject,
        html: emailHtml,
        replyTo: formData.email
      })

      return { success: true, data: result }
    } catch (error) {
      console.error('Resend Fehler:', error)
      return { success: false, error }
    }
  }

  // Option 2: Alternative - E-Mail per externem Service (z.B. EmailJS)
  // Oder einfach nur in der Konsole loggen für Development
  console.log('E-Mail würde gesendet werden:', {
    to: 'info@tierischgutbetreut.de',
    subject: formData.subject,
    content: `
Neue Anfrage - ${formData.animalType}

KONTAKTDATEN:
Name: ${formData.name}
E-Mail: ${formData.email}
Telefon: ${formData.phone}

TIER-INFORMATION:
Tier: ${formData.animal}
Gewünschte Leistung: ${formData.service}

VERFÜGBARKEIT:
${formData.availability}

NACHRICHT:
${formData.message}

---
Gesendet am: ${new Date(formData.timestamp).toLocaleString('de-DE')}
    `
  })

  return { success: true, message: 'E-Mail in Konsole geloggt (Development-Modus)' }
}

// Für Resend Setup:
// 1. npm install resend
// 2. Bei resend.com registrieren (kostenlos)
// 3. API-Key in .env.local hinzufügen: RESEND_API_KEY=re_xxx
// 4. Domain verifizieren (oder testmode verwenden) 