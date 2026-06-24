import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminDbClient } from '@/lib/admin-auth'
import { sendTransactionalContactEmail } from '@/lib/email'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id: contactId } = await params
    const adminClient = getAdminDbClient()

    const { data, error } = await adminClient
      .from('contact_emails')
      .select('*, sent_by:users(email)')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ emails: data || [] })
  } catch (error) {
    console.error('Error fetching contact emails:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Laden des E-Mail-Verlaufs' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id: contactId } = await params
    const { subject, body } = await request.json()
    const adminClient = getAdminDbClient()

    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Betreff darf nicht leer sein' }, { status: 400 })
    }

    if (!body?.trim()) {
      return NextResponse.json({ error: 'Nachricht darf nicht leer sein' }, { status: 400 })
    }

    const { data: contact, error: contactError } = await adminClient
      .from('contacts')
      .select('id, email, contact_type, status')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Kontakt nicht gefunden' }, { status: 404 })
    }

    if (!contact.email?.trim()) {
      return NextResponse.json({ error: 'Kontakt hat keine E-Mail-Adresse' }, { status: 400 })
    }

    const fromEmail = process.env.SMTP_FROM || 'info@tierischgutbetreut.de'
    const delivery = await sendTransactionalContactEmail({
      to: contact.email.trim(),
      subject: subject.trim(),
      text: body.trim(),
    })

    const { data: emailLog, error: insertError } = await adminClient
      .from('contact_emails')
      .insert({
        contact_id: contactId,
        direction: 'outbound',
        to_email: contact.email.trim(),
        from_email: fromEmail,
        subject: subject.trim(),
        body_text: body.trim(),
        status: delivery.status,
        error_message: delivery.error,
        message_id: delivery.messageId,
        sent_by: auth.user.id,
      })
      .select('*, sent_by:users(email)')
      .single()

    if (insertError) {
      throw insertError
    }

    if (delivery.status === 'failed') {
      return NextResponse.json(
        { error: delivery.error || 'E-Mail-Versand fehlgeschlagen', email: emailLog },
        { status: 502 }
      )
    }

    if (contact.contact_type === 'lead' && contact.status === 'new') {
      await adminClient
        .from('contacts')
        .update({ status: 'contacted', updated_at: new Date().toISOString() })
        .eq('id', contactId)
    }

    return NextResponse.json({ email: emailLog })
  } catch (error) {
    console.error('Error sending contact email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Senden der E-Mail' },
      { status: 500 }
    )
  }
}
