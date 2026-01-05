import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

function getServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'default'
  const cookieName = `sb-${projectRef}-auth-token`
  
  const authCookie = request.cookies.get(cookieName)?.value
  let accessToken: string | undefined

  if (authCookie) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(authCookie))
      accessToken = sessionData.access_token
    } catch (e) {
      accessToken = authCookie
    }
  }

  if (!accessToken) {
    const authHeader = request.headers.get('authorization')
    accessToken = authHeader?.replace('Bearer ', '')
  }

  if (!accessToken) {
    accessToken = request.cookies.get('sb-access-token')?.value
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return { client, accessToken }
}

async function checkAdminAuth(supabase: any, accessToken: string | undefined) {
  if (!accessToken) {
    return { error: 'Nicht autorisiert - Keine Session gefunden', status: 401 }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Nicht autorisiert', status: 401 }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'admin') {
    return { error: 'Nicht autorisiert', status: 403 }
  }

  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)
    const authError = await checkAdminAuth(supabase, accessToken)
    
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const leadId = parseInt(params.id)

    // Hole Lead-Daten
    const { data: lead, error: leadError } = await supabase
      .from('contact_requests')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob bereits ein Customer mit dieser Email existiert
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', lead.email)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Ein Kunde mit dieser E-Mail existiert bereits' },
        { status: 400 }
      )
    }

    // Hole Property Values vom Lead
    const { data: leadPropertyValues } = await supabase
      .from('property_values')
      .select('*')
      .eq('entity_type', 'lead')
      .eq('entity_id', leadId.toString())

    // Hole Notizen vom Lead
    const { data: leadNotes } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('contact_request_id', leadId)

    // Erstelle Customer mit Status "pending" (ohne user_id)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        nachname: lead.name,
        vorname: lead.vorname || '',
        email: lead.email,
        telefonnummer: lead.phone || null,
        status: 'pending',
        onboarding_completed: false,
        datenschutz: lead.privacy || false,
      })
      .select()
      .single()

    if (customerError || !customer) {
      throw customerError || new Error('Fehler beim Erstellen des Kunden')
    }

    // Migriere Property Values vom Lead zum Customer
    if (leadPropertyValues && leadPropertyValues.length > 0) {
      const propertyValueInserts = leadPropertyValues.map(pv => ({
        property_definition_id: pv.property_definition_id,
        entity_type: 'customer' as const,
        entity_id: customer.id,
        value_text: pv.value_text,
        value_number: pv.value_number,
        value_date: pv.value_date,
        value_boolean: pv.value_boolean,
      }))

      const { error: pvError } = await supabase
        .from('property_values')
        .insert(propertyValueInserts)

      if (pvError) {
        console.error('Fehler beim Migrieren der Property Values:', pvError)
        // Lösche Customer wieder, wenn Property Values Migration fehlschlägt
        await supabase.from('customers').delete().eq('id', customer.id)
        throw pvError
      }
    }

    // Migriere Notizen vom Lead zum Customer
    if (leadNotes && leadNotes.length > 0) {
      const noteInserts = leadNotes.map(note => ({
        customer_id: customer.id,
        note: note.note,
        created_by: note.created_by,
        created_at: note.created_at,
        updated_at: note.updated_at,
      }))

      const { error: notesError } = await supabase
        .from('customer_notes')
        .insert(noteInserts)

      if (notesError) {
        console.error('Fehler beim Migrieren der Notizen:', notesError)
        // Lösche Customer wieder, wenn Notizen Migration fehlschlägt
        await supabase.from('customers').delete().eq('id', customer.id)
        throw notesError
      }
    }

    // Generiere eindeutigen Token
    const token = randomBytes(32).toString('hex')

    // Erstelle Onboarding-Token mit customer_id (contact_request_id bleibt null)
    // Keine zeitliche Gültigkeit - Token läuft nicht ab
    const { data: onboardingToken, error: tokenError } = await supabase
      .from('onboarding_tokens')
      .insert({
        customer_id: customer.id,
        contact_request_id: null, // Explizit null, da wir jetzt customer_id verwenden
        token,
        expires_at: null, // Keine zeitliche Gültigkeit
        used: false,
      })
      .select()
      .single()

    if (tokenError) {
      console.error('Fehler beim Erstellen des Onboarding-Tokens:', tokenError)
      // Lösche Customer wieder, wenn Token-Erstellung fehlschlägt
      await supabase.from('customers').delete().eq('id', customer.id)
      throw tokenError
    }

    // Lösche Lead (CASCADE löscht automatisch Notes und alte Tokens)
    const { error: deleteError } = await supabase
      .from('contact_requests')
      .delete()
      .eq('id', leadId)

    if (deleteError) {
      console.error('Fehler beim Löschen des Leads:', deleteError)
      // Customer und Token bleiben bestehen, auch wenn Lead-Löschung fehlschlägt
    }

    // Erstelle Onboarding-URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const onboardingUrl = `${baseUrl}/onboarding/${token}`

    // Sende Webhook
    const webhookUrl = process.env.ONBOARDING_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const webhookPayload = {
          event: 'onboarding_link_created',
          customer: {
            id: customer.id,
            name: customer.nachname,
            vorname: customer.vorname,
            email: customer.email,
            phone: customer.telefonnummer,
            status: customer.status,
          },
          onboarding_url: onboardingUrl,
          timestamp: new Date().toISOString(),
        }

        console.log('Sende Webhook an:', webhookUrl)
        console.log('Webhook Payload:', JSON.stringify(webhookPayload, null, 2))

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        })

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          console.error('Webhook-Fehler:', webhookResponse.status, errorText)
        } else {
          console.log('Webhook erfolgreich gesendet')
        }
      } catch (webhookError: any) {
        console.error('Fehler beim Senden des Webhooks:', webhookError.message || webhookError)
        // Webhook-Fehler sollte den Prozess nicht stoppen
      }
    } else {
      console.warn('ONBOARDING_WEBHOOK_URL ist nicht gesetzt')
    }

    return NextResponse.json({
      success: true,
      customer_id: customer.id,
      token: onboardingToken,
      onboarding_url: onboardingUrl,
    })
  } catch (error: any) {
    console.error('Error converting lead:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Konvertierung' },
      { status: 500 }
    )
  }
}


