import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(request: NextRequest) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)

    if (!accessToken) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Hole alle Einstellungen
    const { data: settings, error: settingsError } = await supabase
      .from('newsbar_settings')
      .select('*')
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json({ settings: null, vacationDates: [] })
    }

    // Hole Ferienzeiten
    const { data: vacationDates } = await supabase
      .from('newsbar_vacation_dates')
      .select('*')
      .eq('settings_id', settings.id)
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      settings,
      vacationDates: vacationDates || [],
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)

    if (!accessToken) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { settings, vacationDates } = await request.json()

    // Update Einstellungen
    const { data: updatedSettings, error: settingsError } = await supabase
      .from('newsbar_settings')
      .update({
        title: settings.title,
        subtitle: settings.subtitle,
        dialog_title: settings.dialog_title,
        dialog_description: settings.dialog_description,
        hint_text: settings.hint_text,
        is_active: settings.is_active,
      })
      .eq('id', settings.id)
      .select()
      .single()

    if (settingsError) {
      throw settingsError
    }

    // Lösche alte Ferienzeiten
    await supabase
      .from('newsbar_vacation_dates')
      .delete()
      .eq('settings_id', settings.id)

    // Füge neue Ferienzeiten ein
    if (vacationDates && vacationDates.length > 0) {
      const { error: datesError } = await supabase
        .from('newsbar_vacation_dates')
        .insert(
          vacationDates.map((date: any, index: number) => ({
            settings_id: settings.id,
            period: date.period,
            label: date.label,
            sort_order: index,
          }))
        )

      if (datesError) {
        throw datesError
      }
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    })
  } catch (error: any) {
    console.error('Error updating newsbar:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

